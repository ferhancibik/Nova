let bookList = [],
  basketList = [];

toastr.options = {
  closeButton: false,
  debug: false,
  newestOnTop: false,
  progressBar: false,
  positionClass: "toast-bottom-right",
  preventDuplicates: false,
  onclick: null,
  showDuration: "300",
  hideDuration: "1000",
  timeOut: "5000",
  extendedTimeOut: "1000",
  showEasing: "swing",
  hideEasing: "linear",
  showMethod: "fadeIn",
  hideMethod: "fadeOut",
};

const toggleModal = () => {
  const basketModalEl = document.querySelector(".basket__modal");
  basketModalEl.classList.toggle("active");
};

const getBooks = async () => {
  const res = await fetch("./products.json");
  const books = await res.json();
  bookList = books;
  createBookItemsHtml();
  createBookTypesHtml();
};

const createBookStars = (starRate) => {
  let starRateHtml = "";
  for (let i = 1; i <= 5; i++) {
    if (Math.round(starRate) >= i)
      starRateHtml += `<i class="bi bi-star-fill active"></i>`;
    else starRateHtml += `<i class="bi bi-star-fill"></i>`;
  }
  return starRateHtml;
};

const searchInput = document.getElementById('search-input');
if (searchInput) {
  searchInput.addEventListener('input', (event) => {
    const query = event.target.value.toLowerCase();
    const filteredBooks = bookList.filter(book => 
      book.name.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query)
    );
    createBookItemsHtml(filteredBooks);
  });
}

const createBookItemsHtml = (books = bookList) => {
  const bookListEl = document.querySelector(".book__list");
  if (!bookListEl) return;
  
  let bookListHtml = "";
  books.forEach((book, index) => {
    bookListHtml += `<div class="col-5 ${index % 2 === 0 ? "offset-2" : ""} my-5">
    <div class="row book__card" onclick="openBookDetails(${book.id})">
      <div class="col-6">
        <img
          class="img-fluid shadow"
          src="${book.imgSource}"
          width="258"
          height="400"
        />
      </div>
      <div class="col-6 d-flex flex-column justify-content-between">
        <div class="book__detail">
          <span class="fos gray fs-5">${book.author}</span><br />
          <span class="fs-4 fw-bold">${book.name}</span><br />
          <span class="book__star-rate">
            ${createBookStars(book.starRate)}
            <span class="gray">${book.reviewCount} reviews</span>
          </span>
        </div>
        <p class="book__description fos gray">
          ${book.description}
        </p>
        <div>
          <span class="black fw-bold fs-4 me-2">${book.price}₺</span>
          ${book.oldPrice ? `<span class="fs-4 fw-bold old__price">${book.oldPrice}₺</span>` : ""}
        </div>
        <button class="btn__purple" onclick="addBookToBasket(event, ${book.id})">SEPETE EKLEYİNİZ</button>
      </div>
    </div>
  </div>`;
  });

  bookListEl.innerHTML = bookListHtml;
};

const BOOK_TYPES = {
  ALL: "Tümü",
  NOVEL: "Roman",
  CHILDREN: "Çocuk",
  SELFIMPROVEMENT: "Kişisel Gelişim",
  HISTORY: "Tarih",
  FINANCE: "Finans",
  SCIENCE: "Bilim",
};

const createBookTypesHtml = () => {
  const filterEl = document.querySelector(".filter");
  if (!filterEl) return;
  
  let filterHtml = "";
  let filterTypes = ["ALL"];
  bookList.forEach((book) => {
    if (!filterTypes.includes(book.type)) {
      filterTypes.push(book.type);
    }
  });

  filterTypes.forEach((type, index) => {
    filterHtml += `<li class="${index === 0 ? "active" : ""}" onclick="filterBooks(this)" data-type="${type}">${BOOK_TYPES[type] || type}</li>`;
  });

  filterEl.innerHTML = filterHtml;
};

const filterBooks = async (filterEl) => {
  document.querySelector(".filter .active").classList.remove("active");
  filterEl.classList.add("active");
  let bookType = filterEl.dataset.type;
  await getBooks();
  if (bookType !== "ALL") {
    bookList = bookList.filter((book) => book.type === bookType);
  }
  createBookItemsHtml();
};

const listBasketItems = () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const storageKey = currentUser ? `basketList_${currentUser.id}` : 'basketList';
  
  localStorage.setItem(storageKey, JSON.stringify(basketList));
  
  const basketListEl = document.querySelector(".basket__list");
  const basketCountEl = document.querySelector(".basket__count");
  if (basketCountEl) {
    basketCountEl.innerHTML = basketList.length > 0 ? basketList.length : null;
  }
  const totalPriceEl = document.querySelector(".total__price");

  let basketListHtml = "";
  let totalPrice = 0;
  basketList.forEach((item) => {
    totalPrice += item.product.price * item.quantity;
    basketListHtml += `<li class="basket__item">
        <img
          src="${item.product.imgSource}"
          width="100"
          height="100"
        />
        <div class="basket__item-info">
          <h3 class="book__name">${item.product.name}</h3>
          <span class="book__price">${item.product.price}₺</span><br />
          <span class="book__remove" onclick="removeItemFromBasket(${item.product.id})">remove</span>
        </div>
        <div class="book__count">
          <span class="decrease" onclick="decreaseItemInBasket(${item.product.id})">-</span>
          <span class="my-5">${item.quantity}</span>
          <span class="increase" onclick="increaseItemInBasket(${item.product.id})">+</span>
        </div>
      </li>`;
  });

  if (basketListEl) {
    basketListEl.innerHTML = basketListHtml
      ? basketListHtml
      : `<li class="basket__item">Sepetinizde ürün bulunmamaktadir.</li>`;
  }
  if (totalPriceEl) {
    totalPriceEl.innerHTML =
      totalPrice > 0 ? "Total : " + totalPrice.toFixed(2) + "₺" : null;
  }
};

const addBookToBasket = (event, bookId) => {
  event.stopPropagation();
  let findedBook = bookList.find((book) => book.id == bookId);
  if (findedBook) {
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

    listBasketItems();
    toastr.success("Kitap sepete eklendi!");
  }
};

const removeItemFromBasket = (bookId) => {
  const findedIndex = basketList.findIndex(
    (basket) => basket.product.id == bookId
  );
  if (findedIndex != -1) {
    basketList.splice(findedIndex, 1);
  }

  listBasketItems();
};

const increaseItemInBasket = (bookId) => {
  const findedIndex = basketList.findIndex(
    (basket) => basket.product.id == bookId
  );
  if (findedIndex != -1) {
    basketList[findedIndex].quantity += 1;
  }

  listBasketItems();
};

const decreaseItemInBasket = (bookId) => {
  const findedIndex = basketList.findIndex(
    (basket) => basket.product.id == bookId
  );
  if (findedIndex != -1) {
    if (basketList[findedIndex].quantity != 0) {
      basketList[findedIndex].quantity -= 1;
    }
    if (basketList[findedIndex].quantity == 0) {
      removeItemFromBasket(bookId);
    }
  }

  listBasketItems();
};

const openBookDetails = (bookId) => {
  window.open(`bookDetails.html?bookId=${bookId}`, "_blank");
};

function showBooks() {
  const section = document.querySelector('.store');
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
}

// ============================================
// KULLANICI YÖNETİM SİSTEMİ (LocalStorage)
// ============================================

const registerUser = (username, email, password, favoriteBook = '') => {
  let users = JSON.parse(localStorage.getItem('users')) || [];
  
  const userExists = users.find(u => u.username === username || u.email === email);
  if (userExists) {
    toastr.error('Bu kullanıcı adı veya email zaten kayıtlı!');
    return false;
  }
  
  const newUser = {
    id: Date.now(),
    username: username,
    email: email,
    password: btoa(password),
    favoriteBook: favoriteBook,
    registeredAt: new Date().toISOString(),
    favoriteBooks: favoriteBook ? [favoriteBook] : []
  };
  
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  
  toastr.success('Kayıt başarılı! Giriş yapabilirsiniz.');
  return true;
};

const loginUser = (username, password) => {
  let users = JSON.parse(localStorage.getItem('users')) || [];
  
  const user = users.find(u => 
    (u.username === username || u.email === username) && 
    u.password === btoa(password)
  );
  
  if (user) {
    const userSession = {
      id: user.id,
      username: user.username,
      email: user.email,
      favoriteBook: user.favoriteBook,
      favoriteBooks: user.favoriteBooks || []
    };
    localStorage.setItem('currentUser', JSON.stringify(userSession));
    
    // Kullanıcıya özel sepeti yükle
    const userBasket = localStorage.getItem(`basketList_${user.id}`);
    if (userBasket) {
      basketList = JSON.parse(userBasket);
      listBasketItems();
    }
    
    toastr.success(`Hoş geldiniz, ${user.username}!`);
    return true;
  } else {
    toastr.error('Kullanıcı adı veya şifre hatalı!');
    return false;
  }
};

const logoutUser = () => {
  localStorage.removeItem('currentUser');
  basketList = [];
  listBasketItems();
  toastr.info('Çıkış yapıldı!');
  updateUserDisplay();
};

const updateUserDisplay = () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const userIcon = document.getElementById('user-icon');
  
  if (userIcon) {
    if (currentUser) {
      // Kullanıcı giriş yapmışsa adını göster
      userIcon.innerHTML = currentUser.username;
      userIcon.style.cursor = 'pointer';
      userIcon.title = 'Çıkış Yap';
      userIcon.style.fontWeight = 'bold';
      userIcon.style.color = 'var(--purple)';
      userIcon.style.fontSize = '1rem';
    } else {
      // Giriş yapılmamışsa sadece icon göster - DUPLICATE YARATMA!
      userIcon.innerHTML = '<i class="bi bi-person"></i>';
      userIcon.title = 'Giriş Yap / Kayıt Ol';
      userIcon.style.fontWeight = 'normal';
      userIcon.style.fontSize = '';
    }
  }
};

const showLoginModal = () => {
  const modalHTML = `
    <div class="login-modal" id="loginModal">
      <div class="login-modal-content">
        <span class="login-close" onclick="closeLoginModal()">&times;</span>
        <h2 class="login-title">Giriş Yap</h2>
        <form id="loginForm" onsubmit="handleLogin(event)">
          <div class="form-group">
            <label><i class="bi bi-person"></i> Kullanıcı Adı veya Email</label>
            <input type="text" id="loginUsername" required>
          </div>
          <div class="form-group">
            <label><i class="bi bi-lock"></i> Şifre</label>
            <input type="password" id="loginPassword" required>
          </div>
          <button type="submit" class="btn-login">Giriş Yap</button>
        </form>
        <p class="register-link">Hesabınız yok mu? <a href="kayitol.html">Kayıt Ol</a></p>
      </div>
    </div>
  `;
  
  const modalDiv = document.createElement('div');
  modalDiv.innerHTML = modalHTML;
  document.body.appendChild(modalDiv);
  addLoginModalStyles();
};

const closeLoginModal = () => {
  const modal = document.getElementById('loginModal');
  if (modal) modal.remove();
};

const handleLogin = (event) => {
  event.preventDefault();
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;
  
  if (loginUser(username, password)) {
    closeLoginModal();
    updateUserDisplay();
    setTimeout(() => window.location.reload(), 1000);
  }
};

const addLoginModalStyles = () => {
  if (document.getElementById('loginModalStyles')) return;
  
  const style = document.createElement('style');
  style.id = 'loginModalStyles';
  style.textContent = `
    .login-modal {
      position: fixed;
      z-index: 10000;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0,0,0,0.6);
      display: flex;
      justify-content: center;
      align-items: center;
      animation: fadeIn 0.3s ease;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .login-modal-content {
      background: white;
      padding: 40px 50px;
      border-radius: 20px;
      max-width: 450px;
      width: 90%;
      box-shadow: 0 15px 50px rgba(153, 113, 206, 0.3);
      animation: slideUp 0.4s ease-out;
      position: relative;
    }
    @keyframes slideUp {
      from { transform: translateY(30px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .login-close {
      position: absolute;
      right: 20px;
      top: 15px;
      font-size: 28px;
      font-weight: bold;
      color: #5c6a79;
      cursor: pointer;
      transition: color 0.3s;
    }
    .login-close:hover {
      color: var(--purple);
    }
    .login-title {
      background: linear-gradient(135deg, var(--purple), var(--pink));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-size: 2rem;
      font-weight: bold;
      text-align: center;
      margin-bottom: 30px;
    }
    .login-modal .form-group {
      margin-bottom: 20px;
    }
    .login-modal label {
      display: block;
      color: #5c6a79;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .login-modal label i {
      margin-right: 8px;
      color: var(--pink);
    }
    .login-modal input {
      width: 100%;
      padding: 12px 15px;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      font-size: 1rem;
      transition: all 0.3s;
    }
    .login-modal input:focus {
      outline: none;
      border-color: var(--purple);
      box-shadow: 0 0 0 3px rgba(153, 113, 206, 0.1);
    }
    .btn-login {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, var(--purple), var(--pink));
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 1.1rem;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s;
      margin-top: 10px;
    }
    .btn-login:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(153, 113, 206, 0.4);
    }
    .register-link {
      text-align: center;
      margin-top: 20px;
      color: #5c6a79;
    }
    .register-link a {
      color: var(--purple);
      font-weight: bold;
      text-decoration: none;
    }
    .register-link a:hover {
      color: var(--pink);
    }
  `;
  document.head.appendChild(style);
};

// Sayfa yüklendiğinde
window.onload = function () {
  getBooks();
  
  // Kullanıcı kontrolü ve sepet yükleme
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const storageKey = currentUser ? `basketList_${currentUser.id}` : 'basketList';
  let savedBasketList = localStorage.getItem(storageKey);
  
  if (savedBasketList) basketList = JSON.parse(savedBasketList);

  listBasketItems();
  updateUserDisplay();
  
  // Kullanıcı ikonu event listener
  setTimeout(() => {
    const userIcon = document.getElementById('user-icon');
    if (userIcon) {
      userIcon.addEventListener('click', () => {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
          const confirmLogout = confirm(`${currentUser.username}, çıkış yapmak istiyor musunuz?`);
          if (confirmLogout) {
            logoutUser();
            window.location.href = 'index.html';
          }
        } else {
          showLoginModal();
        }
      });
    }
  }, 100);
};

// ============================================
// GEMINI AI ASISTAN
// ============================================

const GEMINI_API_KEY = 'AIzaSyDaR7mXRU2bvO_NjhbLDHfrkCRPnMG5H1E';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

let chatHistory = [];

const toggleAIChat = () => {
  const aiChatEl = document.querySelector(".ai__chat");
  if (aiChatEl) {
    aiChatEl.classList.toggle("active");
  }
};

const sendMessageToGemini = async (message) => {
  try {
    // Mesaj uzunluğunu sınırla (yaklaşık 500 kelime = ~750 token)
    const maxLength = 3000; // karakter
    let userMessage = message;
    let messageWasTruncated = false;
    
    if (message.length > maxLength) {
      userMessage = message.substring(0, maxLength) + '...';
      messageWasTruncated = true;
      console.log('Mesaj çok uzun, kısaltıldı:', message.length, '→', maxLength);
    }
    
    // Kullanıcı mesajını geçmişe ekle
    chatHistory.push({
      role: 'user',
      message: userMessage
    });
    
    // Kullanıcı mesajını ekranda göster
    displayMessage(message, 'user'); // Orijinal mesajı göster
    
    // Eğer mesaj kısaltıldıysa kullanıcıya bildir
    if (messageWasTruncated) {
      displayMessage('ℹ️ Mesajınız çok uzun olduğu için kısaltıldı. Lütfen daha kısa mesajlar gönderin.', 'ai');
    }
    
    // Loading göster
    showTypingIndicator();
    
    // Kısa ve öz sistem mesajı
    const systemPrompt = `Sen Nova Bookshop'un AI asistanısın. Kitap önerileri yap, kitaplar hakkında konuş. Türkçe cevap ver.`;
    
    const requestBody = {
      contents: [{
        parts: [{
          text: systemPrompt + "\n\nKullanıcı: " + userMessage
        }]
      }],
      generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192, // Maksimum uzunluk - tam cevaplar için
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_NONE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_NONE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_NONE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_NONE"
        }
      ]
    };
    
    console.log('Gemini API\'ye istek gönderiliyor...');
    
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('API Response Status:', response.status);
    console.log('API Response Headers:', [...response.headers.entries()]);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { error: { message: errorText } };
      }
      console.error('API Error Parsed:', errorData);
      throw new Error(`API Error: ${errorData.error?.message || errorText || 'Bilinmeyen hata'}`);
    }
    
    const data = await response.json();
    console.log('API Response:', data);
    
    // Response parsing
    let aiResponse = '';
    
    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];
      console.log('Candidate:', candidate);
      console.log('Finish Reason:', candidate.finishReason);
      
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        aiResponse = candidate.content.parts[0].text;
        console.log('AI Response Text:', aiResponse);
      } else {
        console.error('Parts bulunamadı:', candidate.content);
        throw new Error('AI cevabında metin bulunamadı');
      }
      
      // Eğer cevap token limiti yüzünden kesildiyse kullanıcıyı bilgilendir
      if (candidate.finishReason === 'MAX_TOKENS') {
        aiResponse += '\n\n⚠️ (Cevap çok uzun olduğu için kesintiye uğradı. Devam etmesini isterseniz "devam et" yazın)';
      }
    } else {
      console.error('Candidates bulunamadı:', data);
      throw new Error('API\'den geçersiz yanıt alındı');
    }
    
    if (!aiResponse || aiResponse.trim() === '') {
      throw new Error('AI cevabı boş');
    }
    
    // Loading'i kaldır
    removeTypingIndicator();
    
    // AI cevabını göster
    displayMessage(aiResponse, 'ai');
    
    // AI cevabını geçmişe ekle
    chatHistory.push({
      role: 'ai',
      message: aiResponse
    });
    
  } catch (error) {
    console.error('Gemini API Hatası:', error);
    removeTypingIndicator();
    
    // Daha detaylı hata mesajı
    let errorMessage = 'Üzgünüm, şu anda bir hata oluştu. ';
    if (error.message.includes('API Error')) {
      errorMessage += 'API bağlantı hatası. Lütfen API key\'inizi kontrol edin.';
    } else if (error.message.includes('fetch')) {
      errorMessage += 'İnternet bağlantınızı kontrol edin.';
    } else {
      errorMessage += 'Lütfen tekrar deneyin.';
    }
    
    displayMessage(errorMessage, 'ai');
  }
};

const displayMessage = (message, sender) => {
  const chatMessagesEl = document.querySelector('.ai__messages');
  if (!chatMessagesEl) return;
  
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('ai__message', sender === 'user' ? 'user-message' : 'ai-message');
  
  const avatar = sender === 'user' ? '👤' : '🤖';
  const formattedMessage = message.replace(/\n/g, '<br>');
  
  messageDiv.innerHTML = `
    <div class="message-avatar">${avatar}</div>
    <div class="message-content">${formattedMessage}</div>
  `;
  
  chatMessagesEl.appendChild(messageDiv);
  chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
};

const showTypingIndicator = () => {
  const chatMessagesEl = document.querySelector('.ai__messages');
  if (!chatMessagesEl) return;
  
  const typingDiv = document.createElement('div');
  typingDiv.classList.add('ai__message', 'ai-message', 'typing-indicator');
  typingDiv.id = 'typingIndicator';
  typingDiv.innerHTML = `
    <div class="message-avatar">🤖</div>
    <div class="message-content">
      <div class="typing-dots">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;
  
  chatMessagesEl.appendChild(typingDiv);
  chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
};

const removeTypingIndicator = () => {
  const typingIndicator = document.getElementById('typingIndicator');
  if (typingIndicator) {
    typingIndicator.remove();
  }
};

const handleAISubmit = (event) => {
  if (event) event.preventDefault();
  
  const inputEl = document.querySelector('.ai__input');
  if (!inputEl) return;
  
  const message = inputEl.value.trim();
  if (message) {
    sendMessageToGemini(message);
    inputEl.value = '';
  }
};

// Enter tuşu ile mesaj gönderme
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const inputEl = document.querySelector('.ai__input');
    if (inputEl) {
      inputEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleAISubmit();
        }
      });
    }
  }, 1000);
});