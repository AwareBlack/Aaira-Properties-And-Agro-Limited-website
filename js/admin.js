<script type="module">
import { auth, db } from "./firebase.js";
import { signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { addDoc, collection } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const cloudName = "dlt29pmfq";
const uploadPreset = "aaira_upload";

document.getElementById("loginForm")?.addEventListener("submit", async e => {
  e.preventDefault();
  signInWithEmailAndPassword(auth,
    email.value, password.value
  );
});

document.getElementById("projectForm")?.addEventListener("submit", async e => {
  e.preventDefault();
  const file = image.files[0];

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData
  });

  const data = await res.json();

  await addDoc(collection(db, "projects"), {
    title: title.value,
    price: price.value,
    location: location.value,
    image: data.secure_url
  });

  alert("Project added!");
});
</script>
