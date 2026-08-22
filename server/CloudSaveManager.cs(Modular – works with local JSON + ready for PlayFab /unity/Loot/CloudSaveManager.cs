using UnityEngine;
using UnityEngine.Networking;
using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Text;

public class CloudSaveManager : MonoBehaviour
{
    public static CloudSaveManager Instance { get; private set; }

    public enum CloudProvider { LocalOnly, PlayFab, Steam, CustomHTTP }
    public enum SyncStatus { Idle, Syncing, Success, Failed, Offline }

    [Header("Provider")]
    public CloudProvider provider = CloudProvider.CustomHTTP;

    [Header("Custom HTTP Backend")]
    public string cloudBaseUrl = "https://your-backend.com/api/typevii/";
    public string playerId = "player_001";               // replace with real player ID from login

    [Header("Sync Settings")]
    public bool autoSyncOnSave = true;
    public bool autoSyncOnStart = true;
    public float retryInterval = 12f;
    public int maxRetries = 6;
    public float requestTimeout = 12f;

    [Header("Conflict Resolution")]
    public bool preferCloudOnConflict = false;          // false = keep higher pity values (safer)

    [Header("Status (read-only)")]
    public SyncStatus currentStatus = SyncStatus.Idle;
    public string lastSyncTime = "-";
    public string lastError = "";

    // Events
    public Action<SyncStatus> OnSyncStatusChanged;
    public Action<string> OnCloudDataLoaded;            // raw JSON
    public Action OnSyncCompleted;

    // Internal
    private Queue<string> pendingUploads = new Queue<string>();
    private bool isSyncing = false;
    private int currentRetryCount = 0;
    private string localPityPath => Path.Combine(Application.persistentDataPath, "TypeVII_PitySave.json");
    private Coroutine syncRoutine;

    void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
            return;
        }
    }

    void Start()
    {
        if (autoSyncOnStart)
            StartCoroutine(InitialCloudSync());
    }

    // =========================================================
    // PUBLIC API (called by PitySystem)
    // =========================================================

    /// <summary>
    /// Called by PitySystem every time it saves locally.
    /// </summary>
    public void SavePityData(string json)
    {
        // 1. Always write local first (offline-first)
        try
        {
            File.WriteAllText(localPityPath, json);
        }
        catch (Exception e)
        {
            Debug.LogError($"[Cloud] Local write failed: {e.Message}");
        }

        if (provider == CloudProvider.LocalOnly) return;

        // 2. Queue for upload
        pendingUploads.Enqueue(json);

        if (autoSyncOnSave && !isSyncing)
            syncRoutine = StartCoroutine(ProcessUploadQueue());
    }

    /// <summary>
    /// Called by PitySystem on load / start.
    /// </summary>
    public void LoadPityData(Action<string> onLoaded)
    {
        StartCoroutine(LoadRoutine(onLoaded));
    }

    public void ForceSyncNow()
    {
        if (File.Exists(localPityPath))
        {
            string json = File.ReadAllText(localPityPath);
            pendingUploads.Enqueue(json);
        }

        if (!isSyncing)
            syncRoutine = StartCoroutine(ProcessUploadQueue());
    }

    public void SetPlayerId(string id)
    {
        playerId = id;
    }

    // =========================================================
    // CORE SYNC LOGIC
    // =========================================================

    private IEnumerator InitialCloudSync()
    {
        yield return new WaitForSeconds(0.5f); // let other systems wake up
        yield return LoadRoutine(null);
        yield return ProcessUploadQueue();
    }

    private IEnumerator LoadRoutine(Action<string> onLoaded)
    {
        SetStatus(SyncStatus.Syncing);

        string cloudJson = null;

        switch (provider)
        {
            case CloudProvider.CustomHTTP:
                yield return StartCoroutine(DownloadFromCustomHTTP((result) => cloudJson = result));
                break;

            case CloudProvider.PlayFab:
                yield return StartCoroutine(DownloadFromPlayFab((result) => cloudJson = result));
                break;

            case CloudProvider.Steam:
                yield return StartCoroutine(DownloadFromSteam((result) => cloudJson = result));
                break;

            default:
                cloudJson = null;
                break;
        }

        string finalJson = ResolveConflict(cloudJson);

        if (!string.IsNullOrEmpty(finalJson))
        {
            // Write resolved data back to local
            File.WriteAllText(localPityPath, finalJson);
            OnCloudDataLoaded?.Invoke(finalJson);
        }

        onLoaded?.Invoke(finalJson);
        SetStatus(string.IsNullOrEmpty(cloudJson) ? SyncStatus.Offline : SyncStatus.Success);
        OnSyncCompleted?.Invoke();
    }

    private IEnumerator ProcessUploadQueue()
    {
        if (isSyncing) yield break;
        isSyncing = true;
        SetStatus(SyncStatus.Syncing);

        while (pendingUploads.Count > 0)
        {
            string json = pendingUploads.Peek();
            bool success = false;

            switch (provider)
            {
                case CloudProvider.CustomHTTP:
                    yield return StartCoroutine(UploadToCustomHTTP(json, (ok) => success = ok));
                    break;

                case CloudProvider.PlayFab:
                    yield return StartCoroutine(UploadToPlayFab(json, (ok) => success = ok));
                    break;

                case CloudProvider.Steam:
                    yield return StartCoroutine(UploadToSteam(json, (ok) => success = ok));
                    break;
            }

            if (success)
            {
                pendingUploads.Dequeue();
                currentRetryCount = 0;
                lastSyncTime = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
                SetStatus(SyncStatus.Success);
            }
            else
            {
                currentRetryCount++;
                SetStatus(SyncStatus.Failed);

                if (currentRetryCount >= maxRetries)
                {
                    Debug.LogWarning("[Cloud] Max retries reached. Will try again later.");
                    break;
                }

                yield return new WaitForSeconds(retryInterval);
            }
        }

        isSyncing = false;
        OnSyncCompleted?.Invoke();
    }

    // =========================================================
    // CONFLICT RESOLUTION
    // =========================================================

    private string ResolveConflict(string cloudJson)
    {
        string localJson = File.Exists(localPityPath) ? File.ReadAllText(localPityPath) : null;

        if (string.IsNullOrEmpty(cloudJson)) return localJson;
        if (string.IsNullOrEmpty(localJson)) return cloudJson;

        try
        {
            PitySaveData localData = JsonUtility.FromJson<PitySaveData>(localJson);
            PitySaveData cloudData = JsonUtility.FromJson<PitySaveData>(cloudJson);

            if (preferCloudOnConflict)
                return cloudJson;

            // Smart merge: keep the higher pity value for every counter
            Dictionary<string, PityCounter> merged = new Dictionary<string, PityCounter>();

            void AddOrMerge(List<PityCounter> list)
            {
                foreach (var c in list)
                {
                    string key = $"{c.tableID}_{c.track}";
                    if (!merged.ContainsKey(key) || c.currentPity > merged[key].currentPity)
                        merged[key] = c;
                }
            }

            AddOrMerge(localData.counters);
            AddOrMerge(cloudData.counters);

            PitySaveData result = new PitySaveData
            {
                counters = new List<PityCounter>(merged.Values),
                lastSaved = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")
            };

            return JsonUtility.ToJson(result, true);
        }
        catch