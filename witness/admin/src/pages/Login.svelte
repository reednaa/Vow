<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { api } from "../lib/api";

  const dispatch = createEventDispatcher();

  let password = "";
  let loading = false;
  let error = "";

  async function submit() {
    if (!password || loading) return;
    loading = true;
    error = "";
    try {
      await api.login(password);
      dispatch("login");
    } catch (e: any) {
      error = e.message ?? "Login failed";
    } finally {
      loading = false;
    }
  }
</script>

<div class="container">
  <div class="card">
    <div class="logo">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z"
          fill="var(--accent)"/>
      </svg>
    </div>
    <h1>Witness Admin</h1>
    <p class="sub">Enter your admin password to continue</p>

    {#if error}
      <div class="alert alert-error">{error}</div>
    {/if}

    <form on:submit|preventDefault={submit}>
      <input
        type="password"
        placeholder="Password"
        bind:value={password}
        autocomplete="current-password"
        autofocus
      />
      <button type="submit" class="btn-primary" disabled={loading || !password}>
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  </div>
</div>

<style>
  .container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 24px;
  }
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 40px 36px;
    width: 100%;
    max-width: 380px;
    text-align: center;
  }
  .logo { margin-bottom: 16px; }
  h1 { font-size: 22px; font-weight: 700; margin-bottom: 6px; }
  .sub { color: var(--text-muted); margin-bottom: 24px; font-size: 13px; }
  form { display: flex; flex-direction: column; gap: 12px; }
  button { width: 100%; padding: 10px; font-size: 15px; font-weight: 600; }
</style>
