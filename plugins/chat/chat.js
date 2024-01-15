var $messages = $('.messages-content'),
    d, h, m,
    i = 0;

const endpoint = "https://starfish-app-kye5p.ondigitalocean.app/ask"
const headers = {"Content-Type": "application/json"}
const method = "POST"

$(window).load(function() {
  // $messages.mCustomScrollbar();
  setTimeout(function() {
    fakeMessage();
  }, 100);
});


function setDate(){
  d = new Date()
  if (m != d.getMinutes()) {
    m = d.getMinutes();
    $('<div class="timestamp">' + d.getHours() + ':' + m + '</div>').appendTo($('.message:last'));
  }
}

function insertMessage() {
  msg = $('.message-input').val();
  if ($.trim(msg) == '') {
    return false;
  }
  $('<div class="message message-personal">' + msg + '</div>').appendTo($('.messages-content')).addClass('new');
  setDate();
  $('.message-input').val(null);
  updateScrollbar();
  // fakeMessage();
  goodMessage();
  // $messages.mCustomScrollbar("update");
  //   setTimeout(function(){
  //       $messages.mCustomScrollbar("scrollTo","bottom");
  //   },1000);
  setDate()
}

$('.message-submit').click(function() {
  insertMessage();
});

$('.message-reset').click(function() {
  removeDivsAndExecuteFakeMessage();
});

$(window).on('keydown', function(e) {
  if (e.which == 13) {
    insertMessage();
    return false;
  }
})

var Fake = [
    'Cześć! Jestem botem opowiadającym o Przemku. Nie czekaj - zadaj mi pytanie :)',
    'Witaj, możemy porozmawiać o Przemku. A może chcesz wiedzieć jaka będzie jutro pogoda?',
    'Drogi zwiedzaczu strony, porozmawiaj ze mną, a chętnie udzielę Ci informacji o Przemku i jego ścieżce kariery!'
]

function fakeMessage() {
  if ($('.message-input').val() != '') {
    return false;
  }
  $('<div class="message loading new"><figure class="avatar"><img src="https://media.licdn.com/dms/image/D4D03AQHZOPwxjEjR0Q/profile-displayphoto-shrink_400_400/0/1696445285366?e=2147483647&v=beta&t=SpW-Pkn5zFK5eQCqs7OwSrtsotPNu2TXUgHQy5mZzsg" /></figure><span></span></div>').appendTo($('.messages-content'));
  updateScrollbar();

  const i = Math.floor(Math.random() * Fake.length);
  setTimeout(function() {
    $('.message.loading').remove();
    $('<div class="message new"><figure class="avatar"><img src="https://media.licdn.com/dms/image/D4D03AQHZOPwxjEjR0Q/profile-displayphoto-shrink_400_400/0/1696445285366?e=2147483647&v=beta&t=SpW-Pkn5zFK5eQCqs7OwSrtsotPNu2TXUgHQy5mZzsg" /></figure>' + Fake[i] + '</div>').appendTo($('.messages-content')).addClass('new');
    setDate();
    updateScrollbar();
  }, 1000 + (Math.random() * 20) * 100);

}

function goodMessage() {
  if ($('.message-input').val() != '') {
      return false;
  }
  const chatHistory = parseMessageDivs();

  // Tworzenie danych do wysłania
  const dataToSend = {
    message: msg,
    chat_history: chatHistory,
  };
  console.log(dataToSend);
  $('<div class="message loading new"><figure class="avatar"><img src="https://media.licdn.com/dms/image/D4D03AQHZOPwxjEjR0Q/profile-displayphoto-shrink_400_400/0/1696445285366?e=2147483647&v=beta&t=SpW-Pkn5zFK5eQCqs7OwSrtsotPNu2TXUgHQy5mZzsg" /></figure><span></span></div>').appendTo($('.messages-content'));
  updateScrollbar();

  // $('.message.loading').remove();
  
  sendCurlRequest(endpoint, method, headers, dataToSend)
      .then(responseData => {
          console.log("Response:", responseData);
          return responseData.result; // Zwracanie wartości z pola 'result'
      })
      .then(result => {
          $('<div class="message new"><figure class="avatar"><img src="https://media.licdn.com/dms/image/D4D03AQHZOPwxjEjR0Q/profile-displayphoto-shrink_400_400/0/1696445285366?e=2147483647&v=beta&t=SpW-Pkn5zFK5eQCqs7OwSrtsotPNu2TXUgHQy5mZzsg" /></figure>' + result + '</div>').appendTo($('.messages-content')).addClass('new');
          setDate(); // Przeniesione wywołanie setDate() tutaj, po dodaniu diva
          updateScrollbar();
      })
      .then(x => {
        $('.message.loading').remove();
      })
      .catch(error => {
          console.error("Error:", error);
      });

  updateScrollbar();
}

function updateScrollbar() {
  // Pobierz element messages-content
  var messagesContent = document.querySelector('.messages-content');

  // Przewiń messages-content na sam dół płynnie
  messagesContent.scrollTo({
    top: messagesContent.scrollHeight,
    behavior: 'smooth'
  });
}

async function sendCurlRequest(endpoint, method, headers, body) {
    try {
        const response = await fetch(endpoint, {
            method: method,
            headers: headers,
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error sending request:", error.message);
        throw error;
    }
}

function parseMessageDivs() {
  // Pobieranie wszystkich divów o klasie "messages-content"
  const messageDivs = document.querySelectorAll('.messages-content div');

  // Lista, do której będą dodawane słowniki
  const messagesList = [];

  // Iteracja przez każdy div
  messageDivs.forEach(div => {
    // Sprawdzanie typu diva
    if (div.classList.contains('message-personal') && div.classList.contains('new')) {
      // Pobieranie tekstu z diva "message-personal new", ignorowanie tekstu zagnieżdżonego
      const messageText = Array.from(div.childNodes)
        .filter(node => node.nodeType === Node.TEXT_NODE)
        .map(node => node.textContent.trim())
        .join(' ');

      messagesList.push({ agent: 'user', message: messageText });
    } else if (div.classList.contains('message') && div.classList.contains('new')) {
      // Pobieranie tekstu z diva "message new", ignorowanie tekstu zagnieżdżonego
      const messageText = Array.from(div.childNodes)
        .filter(node => node.nodeType === Node.TEXT_NODE)
        .map(node => node.textContent.trim())
        .join(' ');

      messagesList.push({ agent: 'bot', message: messageText });
    }
  });

  // Zwracanie listy
  return messagesList.slice(0, -1);
}

function removeDivsAndExecuteFakeMessage() {
  // Pobieranie elementu o klasie "messages-content"
  const messagesContent = document.querySelector('.messages-content');

  // Sprawdzenie, czy element istnieje
  if (messagesContent) {
    // Usuwanie wszystkich divów wewnątrz elementu
    while (messagesContent.firstChild) {
      messagesContent.removeChild(messagesContent.firstChild);
    }

    // Wywołanie funkcji fakeMessage()
    fakeMessage();
  } else {
    console.error("Element with class 'messages-content' not found");
  }
}