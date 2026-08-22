import { o as __toESM } from "../_runtime.mjs";
import { B as require_react, _ as Link, b as require_jsx_runtime, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as signIn, t as authClient } from "./client-B40BzJxt.mjs";
import { t as GROK_PROVIDERS } from "./server-BYkFpKMJ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-jbCVbaCG.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Login() {
	const nav = useNavigate();
	const [mode, setMode] = (0, import_react.useState)("in");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [name, setName] = (0, import_react.useState)("");
	const [err, setErr] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const submit = async () => {
		setErr("");
		setBusy(true);
		try {
			if (mode === "up") {
				const { error } = await authClient.signUp.email({
					email: email.trim(),
					password,
					name: name.trim() || email.split("@")[0] || "Sovereign",
					callbackURL: "/"
				});
				if (error) throw new Error(error.message ?? "Could not create the oath.");
			} else {
				const { error } = await authClient.signIn.email({
					email: email.trim(),
					password,
					callbackURL: "/"
				});
				if (error) throw new Error(error.message ?? "The gate refused that name.");
			}
			await nav({ to: "/" });
		} catch (e) {
			setErr(e instanceof Error ? e.message : "The gate is sealed.");
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative grid min-h-dvh place-items-center overflow-hidden bg-bg px-5 py-10 text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-0 bg-cover bg-center opacity-30",
				style: { backgroundImage: "url(/lore/title-wide.jpg)" }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-0",
				style: { background: "radial-gradient(ellipse at 50% 20%, #2a0505 0%, #020008 62%, #000 100%)" }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative w-full max-w-sm space-y-4 rounded-md border border-border bg-surface/80 p-6 backdrop-blur-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-xs tracking-[0.35em] text-crimson",
						children: "THE THRESHOLD"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-3xl tracking-[0.08em] text-crimson",
						children: "Sign the oath"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Email and password, Google, or X. Progress binds to the name you keep."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex gap-2",
							children: GROK_PROVIDERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => signIn(p.providerId, { callbackURL: "/" }),
								className: "flex-1 rounded-md border border-border bg-raised px-3 py-2.5 font-display text-xs tracking-widest text-fg hover:border-crimson",
								children: p.label
							}, p.providerId))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-center font-display text-[0.65rem] tracking-[0.28em] text-subtle",
							children: "OR BY BLOOD SCRIPT"
						}),
						mode === "up" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: name,
							onChange: (e) => setName(e.target.value),
							placeholder: "Name",
							autoComplete: "name",
							className: "h-11 w-full rounded-md border border-border bg-bg px-3 font-sans text-sm text-fg caret-crimson"
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: email,
							onChange: (e) => setEmail(e.target.value),
							placeholder: "Email",
							type: "email",
							autoComplete: "email",
							className: "h-11 w-full rounded-md border border-border bg-bg px-3 font-sans text-sm text-fg caret-crimson"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: password,
							onChange: (e) => setPassword(e.target.value),
							placeholder: "Password",
							type: "password",
							autoComplete: mode === "up" ? "new-password" : "current-password",
							className: "h-11 w-full rounded-md border border-border bg-bg px-3 font-sans text-sm text-fg caret-crimson"
						}),
						err ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-crimson",
							children: err
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: busy || !email || password.length < 8,
							onClick: () => void submit(),
							className: "w-full rounded-md border border-crimson bg-crimson/20 py-3 font-display text-sm tracking-[0.18em] text-fg hover:bg-crimson hover:text-bg disabled:opacity-40",
							children: busy ? "SEALING…" : mode === "up" ? "CREATE THE OATH" : "ENTER"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setMode(mode === "up" ? "in" : "up"),
							className: "w-full font-display text-xs tracking-widest text-muted hover:text-fg",
							children: mode === "up" ? "Already sworn? Sign in" : "New blood? Create an account"
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "block pt-2 text-center font-display text-xs tracking-[0.28em] text-subtle hover:text-crimson",
						children: "Continue as guest"
					})
				]
			})
		]
	});
}
//#endregion
export { Login as component };
