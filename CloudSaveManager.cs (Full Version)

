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
    public string playerId = "player_001";               // set this from your login system

    [Header("Sync Settings")]
    public bool autoSyncOnSave = true;
    public bool autoSyncOnStart = true;
    public float retryInterval = 12f;
    public int maxRetries = 6;
    public float requestTimeout = 10f;

    [Header("Status (Read Only)")]
    public SyncStatus currentStatus = SyncStatus.Idle;
    public string lastSyncTime = "-";
    public string lastError = "";

    // Events
    public Action<SyncStatus> OnSyncStatusChanged;
    public Action<string> OnCloudDataLoaded;             // raw JSON

    // Internal
    private Queue<string> pendingUploads = new Queue<string>();
    private bool isSyncing = false;
    private int currentRetryCount = 0;
    private string LocalPityPath => Path.Combine(Application.persistentDataPath, "TypeVII_PitySave.json");

    // ======================== LIFECYCLE ========================

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

    // ======================== PUBLIC API ========================

    /// <summary>
    /// Called by PitySystem every time it saves locally.
    /// </summary>
    public void SavePityData(string json)
    {
        // 1. Always write local first (offline-first)
        try
        {
            File.WriteAllText(LocalPityPath, json);
        }
        catch (Exception e)
        {
            Debug.LogError($"[Cloud] Local write failed: {e.Message}");
        }

        if (provider == CloudProvider.LocalOnly) return;

        // 2. Queue for cloud upload
        pendingUploads.Enqueue(json);

        if (autoSyncOnSave && !isSyncing)
            StartCoroutine(ProcessUploadQueue());
    }

    /// <summary>
    /// Called by PitySystem on startup / load.
    /// </summary>
    public void LoadPityData(Action<string> onLoaded)
    {
        StartCoroutine(LoadFromCloudCoroutine(onLoaded));
    }

    public void ForceSyncNow()
    {
        if (File.Exists(LocalPityPath))
        {
            string json = File.ReadAllText(LocalPityPath);
            pendingUploads.Enqueue(json);
        }

        if (!isSyncing)
            StartCoroutine(ProcessUploadQueue());
    }

    // ======================== CORE SYNC LOGIC ========================

    private IEnumerator InitialCloudSync()
    {
        SetStatus(SyncStatus.Syncing);

        // First try to pull latest from cloud
        bool cloudLoaded = false;
        string cloudJson = null;

        yield return LoadFromCloudCoroutine((json) =>
        {
            cloudJson = json;
            cloudLoaded = true;
        });

        // Wait until callback fires
        while (!cloudLoaded) yield return null;

        if (!string.IsNullOrEmpty(cloudJson))
        {
            // Cloud has data → apply it (and overwrite local)
            File.WriteAllText(LocalPityPath, cloudJson);
            OnCloudDataLoaded?.Invoke(cloudJson);
            Debug.Log("[Cloud] Loaded newer data from cloud");
        }

        // Then push any local pending changes
        if (File.Exists(LocalPityPath))
        {
            string localJson = File.ReadAllText(LocalPityPath);
            pendingUploads.Enqueue(localJson);
            yield return ProcessUploadQueue();
        }

        SetStatus(SyncStatus.Success);
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

            yield return UploadToCloud(json, (ok) => success = ok);

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
                if (currentRetryCount >= maxRetries)
                {
                    Debug.LogWarning("[Cloud] Max retries reached – will try again later");
                    SetStatus(SyncStatus.Failed);
                    break;
                }

                SetStatus(SyncStatus.Offline);
                yield return new WaitForSeconds(retryInterval);
            }
        }

        isSyncing = false;
    }

    private IEnumerator UploadToCloud(string json, Action<bool> onComplete)
    {
        switch (provider)
        {
            case CloudProvider.CustomHTTP:
                yield return UploadCustomHTTP(json, onComplete);
                break;

            case CloudProvider.PlayFab:
                // Placeholder – replace with real PlayFab call
                Debug.Log("[Cloud] PlayFab upload (add SDK)");
                onComplete?.Invoke(true);
                break;

            case CloudProvider.Steam:
                // Placeholder – replace with SteamRemoteStorage
                Debug.Log("[Cloud] Steam upload (add Steamworks.NET)");
                onComplete?.Invoke(true);
                break;

            default:
                onComplete?.Invoke(true);
                break;
        }
    }

    private IEnumerator LoadFromCloudCoroutine(Action<string> onLoaded)
    {
        switch (provider)
        {
            case CloudProvider.CustomHTTP:
                yield return LoadCustomHTTP(onLoaded);
                break;

            case CloudProvider.PlayFab:
                onLoaded?.Invoke(null); // add real PlayFab GetUserData
                break;

            case CloudProvider.Steam:
                onLoaded?.Invoke(null); // add real SteamRemoteStorage
                break;

            default:
                onLoaded?.Invoke(null);
                break;
        }
    }

    // ======================== CUSTOM HTTP IMPLEMENTATION ========================

    private IEnumerator UploadCustomHTTP(string json, Action<bool> onComplete)
    {
        string url = $"{cloudBaseUrl}pity/{playerId}";

        using (UnityWebRequest req = new UnityWebRequest(url, "PUT"))
        {
            byte[] body = Encoding.UTF8.GetBytes(json);
            req.uploadHandler = new UploadHandlerRaw(body);
            req.downloadHandler = new DownloadHandlerBuffer();
            req.SetRequestHeader("Content-Type", "application/json");
            req.timeout = (int)requestTimeout;

            yield return req.SendWebRequest();

            if (req.result == UnityWebRequest.Result.Success)
            {
                Debug.Log("[Cloud] Upload success");
                onComplete?.Invoke(true);
            }
            else
            {
                lastError = req.error;
                Debug.LogWarning($"[Cloud] Upload failed: {req.error}");
                onComplete?.Invoke(false);
            }
        }
    }

    private IEnumerator LoadCustomHTTP(Action<string> onLoaded)
    {
        string url = $"{cloudBaseUrl}pity/{playerId}";

        using (UnityWebRequest req = UnityWebRequest.Get(url))
        {
            req.timeout = (int)requestTimeout;
            yield return req.SendWebRequest();

            if (req.result == UnityWebRequest.Result.Success)
            {
                string json = req.downloadHandler.text;
                Debug.Log("[Cloud] Download success");
                onLoaded?.Invoke(json);
            }
            else
            {
                lastError = req.error;
                Debug.LogWarning($"[Cloud] Download failed: {req.error}");
                onLoaded?.Invoke(null); // fall back to local
            }
        }
    }

    // ======================== HELPERS ========================

    private void SetStatus(SyncStatus status)
    {
        currentStatus = status;
        OnSyncStatusChanged?.Invoke(status);
    }

    // Optional: call from a debug UI button
    public void ClearPendingQueue()
    {
        pendingUploads.Clear();
        currentRetryCount = 0;
        SetStatus(SyncStatus.Idle);
    }
}