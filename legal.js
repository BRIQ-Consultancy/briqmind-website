document.addEventListener('DOMContentLoaded', () => {
    const tocContainer = document.getElementById('legal-toc');
    const contentBody = document.querySelector('.content-body');
    const headings = contentBody.querySelectorAll('h2, h3');

    if (!tocContainer || !contentBody || headings.length === 0) {
        return;
    }

    // 1. İçerik tablosunu (TOC) oluştur
    headings.forEach((heading, index) => {
        const id = `section-${index}`;
        heading.id = id;

        const listItem = document.createElement('li');
        const link = document.createElement('a');
        
        link.href = `#${id}`;
        link.textContent = heading.textContent;
        
        listItem.appendChild(link);
        tocContainer.appendChild(listItem);
    });

    // 2. Kaydırma olayını izle ve aktif linki vurgula
    const tocLinks = tocContainer.querySelectorAll('a');

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Tüm aktif sınıflarını kaldır
                tocLinks.forEach(link => link.classList.remove('active'));
                
                // İlgili linke aktif sınıfını ekle
                const id = entry.target.id;
                const activeLink = tocContainer.querySelector(`a[href="#${id}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }, {
        rootMargin: '0px 0px -75% 0px', // Ekranın üst %25'lik kısmındaki başlığı aktif say
        threshold: 0
    });

    headings.forEach(heading => {
        observer.observe(heading);
    });
});