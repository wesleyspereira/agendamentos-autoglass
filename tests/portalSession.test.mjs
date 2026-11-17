import test from "node:test";
import assert from "node:assert/strict";
import { demoUserName, readPortalName, savePortalName } from "../src/utils/portalSession.js";

test("entrada de demonstração sem credenciais identifica o visitante", () => {
  assert.equal(demoUserName(""), "Visitante");
  assert.equal(demoUserName(null), "Visitante");
});

test("nome ou e-mail informado aparece na saudação", () => {
  assert.equal(demoUserName("wesley.santos@exemplo.com"), "Wesley");
  assert.equal(demoUserName(" Wesley "), "Wesley");
});

test("sessão guarda o nome e sair limpa apenas a identificação", () => {
  const store = new Map();
  const original = Object.getOwnPropertyDescriptor(globalThis, "sessionStorage");
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => store.set(key, value),
      removeItem: (key) => store.delete(key),
    },
  });
  try {
    store.set("outro-dado", "mantido");
    assert.equal(readPortalName(), "");
    savePortalName("Wesley");
    assert.equal(readPortalName(), "Wesley");
    savePortalName("");
    assert.equal(readPortalName(), "");
    assert.equal(store.get("outro-dado"), "mantido");
  } finally {
    if (original) Object.defineProperty(globalThis, "sessionStorage", original);
    else delete globalThis.sessionStorage;
  }
});
