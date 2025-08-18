import requests
import streamlit as st

# ---- Page config (do this once) ----
st.set_page_config(page_title="Career Copilot", page_icon="🧭")
st.title("Career Copilot — MVP")
st.write("Frontend is live. Use the button below to ping the FastAPI backend.")

# You can change this later if you run the API elsewhere
API_BASE = "http://localhost:8000"

col1, col2 = st.columns(2)
with col1:
    if st.button("Check Backend Health", use_container_width=True):
        try:
            r = requests.get(f"{API_BASE}/health", timeout=10)
            r.raise_for_status()
            st.success("Backend reachable ✅")
            st.json(r.json())
        except Exception as e:
            st.error("Could not reach the backend. Is FastAPI running on 8000?")
            st.exception(e)

with col2:
    st.info("Next: we'll add an `/analyze` endpoint and a form here to paste resume + JD.")
