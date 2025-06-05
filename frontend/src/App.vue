<template>
  <section class="section">
    <div class="container">
      <h1 class="title">Login</h1>

      <div class="field">
        <label class="label">Username</label>
        <div class="control">
          <input
            class="input"
            type="text"
            placeholder="Enter username"
            v-model="username"
            @keyup.enter="login"
          />
        </div>
      </div>

      <div class="field">
        <div class="control">
          <button
            class="button is-primary"
            @click="login"
            :disabled="loading || !username"
          >
            <span v-if="loading" class="loader"></span>
            <span v-else>Login</span>
          </button>
        </div>
      </div>

      <div v-if="error" class="notification is-danger">
        {{ error }}
      </div>

      <div v-if="jwt" class="notification is-info">
        <strong>Mock JWT:</strong>
        <pre>{{ jwt }}</pre>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";

const username = ref("");
const jwt = ref("");
const error = ref("");
const loading = ref(false);

const API_SERVER_URL =
  import.meta.env.VITE_API_SERVER_URL || "http://localhost:3001";

async function login() {
  error.value = "";
  jwt.value = "";

  if (!username.value) {
    error.value = "Username is required";
    return;
  }

  loading.value = true;

  try {
    const res = await fetch(`${API_SERVER_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username.value }),
    });

    if (!res.ok) {
      const data = await res.json();
      error.value = data.error || "Login failed";
      return;
    }

    const text = await res.text();
    jwt.value = text;
  } catch {
    error.value = "Network error";
  } finally {
    loading.value = false;
  }
}
</script>

<style>
.loader {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3273dc;
  border-radius: 50%;
  width: 14px;
  height: 14px;
  display: inline-block;
  animation: spin 1s linear infinite;
  vertical-align: middle;
  margin-right: 6px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
