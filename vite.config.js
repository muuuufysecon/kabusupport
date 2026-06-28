:root {
  color: #17202a;
  background: #f5f7fb;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

body {
  margin: 0;
}

.app {
  max-width: 1180px;
  margin: 0 auto;
  padding: 24px;
}

header {
  margin-bottom: 20px;
}

header h1 {
  margin: 0 0 8px;
}

.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 0;
  border-radius: 10px;
  padding: 10px 14px;
  background: #1f6feb;
  color: white;
  font-weight: 700;
  cursor: pointer;
  margin: 4px;
}

button.active {
  background: #111827;
}

button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.card {
  background: white;
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 8px 28px rgba(15, 23, 42, 0.08);
  margin-bottom: 20px;
}

.summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
  margin: 16px 0;
}

.summary div {
  background: #f1f5f9;
  border-radius: 12px;
  padding: 14px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 12px;
}

label {
  display: grid;
  gap: 6px;
  margin: 10px 0;
  font-size: 0.9rem;
  font-weight: 700;
}

input,
select,
textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 10px;
  font: inherit;
  background: white;
}

textarea {
  min-height: 120px;
}

textarea.large {
  min-height: 360px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
  font-size: 0.92rem;
}

th,
td {
  border-bottom: 1px solid #e5e7eb;
  padding: 10px;
  text-align: left;
}

th {
  background: #f8fafc;
}

.glossary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 14px;
  margin-top: 16px;
}

.glossary article {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 14px;
  background: #fbfdff;
}
