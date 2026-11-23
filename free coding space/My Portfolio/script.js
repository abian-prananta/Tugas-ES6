    // 1. Fitur Salin Email Instan ke Clipboard
    const copyEmailBtn = document.getElementById('copyEmailBtn');
    const toast = document.getElementById('toastNotification');
    const copyStatusText = document.getElementById('copyStatusText');
    const emailTarget = "abianprananta596@gmail.com";

    copyEmailBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(emailTarget);
        
        // Update teks status tombol
        copyStatusText.textContent = "Tersalin!";
        copyStatusText.style.color = "#4ade80";

        // Tampilkan Toast
        toast.classList.add('show');
        
        setTimeout(() => {
          toast.classList.remove('show');
          copyStatusText.textContent = "Salin";
          copyStatusText.style.color = "var(--accent-blue-light)";
        }, 3000);
      } catch (err) {
        // Fallback jika permission browser ditolak
        prompt("Salin email ini secara manual:", emailTarget);
      }
    });

    // 2. Smooth Reveal Micro-Interaction saat Scroll (Subtle & Clean)
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -40px 0px"
    };

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
          revealObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Menerapkan transisi pada elemen-elemen kunci
    document.querySelectorAll('.bento-card, .cert-card, .project-card').forEach(el => {
      el.style.opacity = "0";
      el.style.transform = "translateY(18px)";
      el.style.transition = "opacity 0.6s ease-out, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)";
      revealObserver.observe(el);
    });
  