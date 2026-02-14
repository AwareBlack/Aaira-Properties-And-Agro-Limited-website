<script src="https://cdn.jsdelivr.net/npm/emailjs-com@3/dist/email.min.js"></script>
<script>
emailjs.init("1u43jUCuiNJ96Rwgt");

document.getElementById("contactForm")?.addEventListener("submit", function(e){
  e.preventDefault();
  emailjs.send("service_j7jwlqn","template_equgm1k",{
    name: name.value,
    email: email.value,
    message: message.value
  }).then(() => alert("Message sent!"));
});
</script>
