<script type="module">
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBQd_FfHDGMktEynmOQuKh0azjPtgA7eDQ",
  authDomain: "aaira-web-6e3cc.firebaseapp.com",
  projectId: "aaira-web-6e3cc",
  appId: "1:465074494615:web:14311ddfd61e4a3ac15dd2"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
</script>
