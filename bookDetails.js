// BookDetails namespace - Tüm çakışmaları önlemek için
const BookDetails = {
    bookList: [],
    
    // Örnek yorumlar havuzu
    sampleComments: [
        {
            username: "Ayşe Yılmaz",
            rating: 5,
            date: "15 Ekim 2024",
            text: "Muhteşem bir kitap! Okurken kendimi kaybettim. Her sayfası beni büyüledi ve bitirmek istemedim. Herkese şiddetle tavsiye ediyorum!"
        },
        {
            username: "Mehmet Kaya",
            rating: 4,
            date: "12 Ekim 2024",
            text: "Çok güzel bir eser. Yazarın anlatım tarzı oldukça akıcı. Bazı bölümler biraz yavaş ilerliyor ama genel olarak çok beğendim."
        },
        {
            username: "Zeynep Demir",
            rating: 5,
            date: "10 Ekim 2024",
            text: "Harika bir okuma deneyimi! Karakterler çok gerçekçi ve hikaye son derece etkileyici. Okuduğum en iyi kitaplardan biri."
        },
        {
            username: "Can Arslan",
            rating: 5,
            date: "8 Ekim 2024",
            text: "Mükemmel! Bu kitabı okumadan önce ve sonra olarak ayırıyorum hayatımı. Gerçekten çok etkilendim ve herkese tavsiye ederim."
        },
        {
            username: "Elif Şahin",
            rating: 4,
            date: "5 Ekim 2024",
            text: "Güzel bir kitap. Konusu ilgi çekici ve sürükleyici. Sonunu tahmin etmek zordu, bu da artı bir özellik."
        },
        {
            username: "Ahmet Çelik",
            rating: 5,
            date: "3 Ekim 2024",
            text: "Olağanüstü bir eser! Her cümlesi özenle yazılmış. Okurken hissettiklerim tarif edilemez. Kesinlikle okunmalı!"
        },
        {
            username: "Selin Yıldız",
            rating: 4,
            date: "1 Ekim 2024",
            text: "İyi bir kitap. Başlangıcı biraz yavaş ama ilerledikçe hızlanıyor. Sonucu çok beğendim, beklemediğim bir finaldi."
        },
        {
            username: "Burak Öztürk",
            rating: 5,
            date: "28 Eylül 2024",
            text: "Harika bir yapıt! Yazarın hayal gücü muhteşem. Böyle kaliteli eserler görmek çok güzel. Tebrikler!"
        },
        {
            username: "Deniz Acar",
            rating: 5,
            date: "25 Eylül 2024",
            text: "Bu kitap benim için gerçek bir keşifti. Uzun zamandır böyle keyifli bir okuma yapmamıştım. Herkese şiddetle tavsiye ederim!"
        },
        {
            username: "Gizem Koç",
            rating: 4,
            date: "22 Eylül 2024",
            text: "Güzel bir eser. Karakterler ve olay örgüsü güçlü. Bazı yerlerde tekrar var gibi gelse de genel olarak başarılı."
        },
        {
            username: "Emre Yurt",
            rating: 5,
            date: "20 Eylül 2024",
            text: "Fevkalade bir kitap! Okurken zamanın nasıl geçtiğini anlamadım. Her kitapseverin mutlaka okuması gereken bir eser."
        },
        {
            username: "Aylin Karaca",
            rating: 4,
            date: "18 Eylül 2024",
            text: "Çok hoşuma gitti. Yazarın dili sade ve anlaşılır. Konusu da oldukça güncel ve ilgi çekici."
        }
    ],

    getBooks: async function() {
        try {
            console.log('[BookDetails] Kitaplar yükleniyor...');
            const res = await fetch("./products.json");
            console.log('[BookDetails] Fetch response:', res.status);
            
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            
            const books = await res.json();
            console.log('[BookDetails] Kitaplar yüklendi:', books.length, 'kitap');
            this.bookList = books;
            this.displayBookInfo();
            this.displayComments();
        } catch (error) {
            console.error('[BookDetails] Kitaplar yüklenirken hata:', error);
            toastr.error('Kitap bilgileri yüklenemedi!');
        }
    },

    displayBookInfo: function() {
        const urlParams = new URLSearchParams(window.location.search);
        const bookId = urlParams.get('bookId');
        console.log('[BookDetails] URL parametrelerinden bookId:', bookId);
        
        const book = this.bookList.find(book => book.id == bookId);
        console.log('[BookDetails] Bulunan kitap:', book);

        if (book) {
            document.getElementById('book-img').src = book.imgSource;
            document.getElementById('book-name').innerText = book.name;
            document.getElementById('book-author').innerText = book.author;
            document.getElementById('book-description').innerText = book.description;
            document.getElementById('book-price').innerText = book.price + ' TL';
            document.getElementById('book-old-price').innerText = book.oldPrice ? book.oldPrice + ' TL' : '';
            document.title = book.name + ' | Nova Bookshop';

            document.getElementById('book-stars').innerHTML = this.createStars(book.starRate);
            console.log('[BookDetails] Kitap bilgileri DOM\'a yazıldı');
        } else {
            console.error('[BookDetails] Kitap bulunamadı! bookId:', bookId);
            toastr.error('Kitap bulunamadı!');
        }
    },

    createStars: function(starRate) {
        let starRateHtml = "";
        for (let i = 1; i <= 5; i++) {
            if (Math.round(starRate) >= i)
                starRateHtml += `<i class="bi bi-star-fill" style="color: #ffc107;"></i>`;
            else starRateHtml += `<i class="bi bi-star" style="color: #ffc107;"></i>`;
        }
        return starRateHtml;
    },

    displayComments: function() {
        const urlParams = new URLSearchParams(window.location.search);
        const bookId = urlParams.get('bookId');
        
        const numberOfComments = 3 + (bookId % 4);
        const bookComments = this.getRandomComments(bookId, numberOfComments);
        
        const commentsList = document.getElementById('comments-list');
        const commentsCount = document.getElementById('comments-count');
        
        commentsCount.innerText = `${bookComments.length} yorum`;
        
        commentsList.innerHTML = bookComments.map(comment => `
            <div class="comment-item">
                <div class="comment-header">
                    <div class="comment-avatar">
                        ${comment.username.charAt(0).toUpperCase()}
                    </div>
                    <div class="comment-user-info">
                        <div class="comment-username">${comment.username}</div>
                        <div class="comment-date">${comment.date}</div>
                    </div>
                    <div class="comment-rating">
                        ${this.createCommentStars(comment.rating)}
                    </div>
                </div>
                <div class="comment-text">
                    ${comment.text}
                </div>
            </div>
        `).join('');
    },

    createCommentStars: function(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += '<i class="bi bi-star-fill"></i>';
            } else {
                stars += '<i class="bi bi-star"></i>';
            }
        }
        return stars;
    },

    seededRandom: function(seed) {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    },

    getRandomComments: function(bookId, count) {
        const shuffled = [...this.sampleComments];
        
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(this.seededRandom(bookId * 1000 + i) * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        return shuffled.slice(0, count);
    },

    addToBasket: function() {
        const urlParams = new URLSearchParams(window.location.search);
        const bookId = urlParams.get('bookId');
        let findedBook = this.bookList.find((book) => book.id == bookId);
        if (findedBook) {
            let basketList = JSON.parse(localStorage.getItem("basketList")) || [];
            const basketAlreadyIndex = basketList.findIndex(
                (basket) => basket.product.id == bookId
            );
            if (basketAlreadyIndex == -1) {
                let addedItem = {
                    quantity: 1,
                    product: findedBook,
                };
                basketList.push(addedItem);
            } else {
                basketList[basketAlreadyIndex].quantity += 1;
            }

            localStorage.setItem("basketList", JSON.stringify(basketList));
            toastr.success("Kitap sepete eklendi!");
            
            if (typeof listBasketItems === 'function') {
                listBasketItems();
            }
        }
    },

    init: function() {
        console.log('[BookDetails] Sayfa yüklendi, kitap detayları getiriliyor...');
        this.getBooks();
    }
};

// Global fonksiyon - HTML'den çağrılabilmesi için
window.addBookToBasketDetail = function() {
    BookDetails.addToBasket();
};

// Sayfa yüklendiğinde başlat
document.addEventListener('DOMContentLoaded', () => {
    BookDetails.init();
});
