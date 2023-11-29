const darkModeSwitch = document.getElementById('darkModeSwitch');
const body = document.body;
let dark = false;
const resultElement = document.getElementById('txt');

// Resolvemos o problema de não poder iniciar a captura de voz automaticamente
let h1 = document.querySelector('h1');
h1.click();

const GetKey = (service, callback) => {
    fetch('keys.json')
    .then(response => response.json())
    .then(data => {
        callback(data[service]);
    })
    .catch(error => console.error(error));
};

let openAIKey;
let microsoftKey;

GetKey('openai', (key) => {
    openAIKey = key;
});

GetKey('microsoft', (key) => {
    microsoftKey = key;
});

// Check user's preference from localStorage
if (localStorage.getItem('darkMode') === 'enabled') {
    enableDarkMode();
}else{
    disableDarkMode()
}

// Toggle dark mode on switch change
darkModeSwitch.addEventListener('click', () => {
    modeSwitch();
});

const modeSwitch = () => {
    if (!dark) {
        enableDarkMode();
        dark = true;
    } else {
        disableDarkMode();
        dark = false;
    }
}

// Functions to enable/disable dark mode
function enableDarkMode() {
    body.classList.add('dark-mode');
    localStorage.setItem('darkMode', 'enabled');
    darkModeSwitch.innerHTML = '<i class="fas fa-sun icon"></i>';
}

function disableDarkMode() {
    body.classList.remove('dark-mode');
    localStorage.setItem('darkMode', 'disabled');
    darkModeSwitch.innerHTML = '<i class="fas fa-moon icon"></i>';
}

const consultarOpenAI = async(pergunta) => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", "Bearer "+openAIKey);
    myHeaders.append("Cookie", "__cf_bm=.4iV5_ydt80w1MWlcgQTJ.dwPyfpBaEwDoSAZpiD1ek-1701178880-0-AbQ0miXZ5HFntdeU3aWLnAOZ2cSKT0tejoOOsVRCPRg/GnqHB/12KfsUlCD0LT1yoI0Ik/PKUWbSV9/CDzLNGwo=; _cfuvid=4z.is0uhNGJnfeVI4l1GfIQZgjjdqsIJQyThZHoDrNQ-1701178880316-0-604800000");

    var raw = JSON.stringify({
    "model": "ft:gpt-3.5-turbo-0613:zeros-e-um::8PrTlJrT",
    "messages": [
        {
        "role": "system",
        "content": "Jarvis é um chatbot pontual e muito simpático que ajuda as pessoas"
        },
        {
        "role": "user",
        "content": pergunta
        }
    ],
    "temperature": 0.2
    });

    var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
    };

    fetch("https://api.openai.com/v1/chat/completions", requestOptions)
    .then(response => response.json())
    .then(result => reproduzirVoz(result.choices[0].message.content))
    .catch(error => console.log('error', error));
}

const capturarVoz = () => {
    var startButton = document.getElementById('capture');
    var recognition = new webkitSpeechRecognition();

    recognition.lang = window.navigator.language;
    recognition.continuous = true;
    recognition.interimResults = false;

    startButton.innerHTML = '<i class="fas fa-microphone icon"></i>';
    recognition.start();

    recognition.addEventListener('result', (event) => {

        const result = event.results[event.results.length - 1][0].transcript;        

        if (result.toLowerCase().includes('jarvis')) {
            trocarIcone('<i class="fas fa-microphone-slash icon"></i>');
            // Checa se é o comando de trocar tema antes de pesquisar
            if (result.toLowerCase().includes('trocar tema')) {
                modeSwitch();
                recognition.stop();
                restart(recognition);
                return;
            }

            // Comece a salvar a pergunta quando "Jarvis" é detectado
            let array_pergunta = result.toLowerCase().split(/(jarvis)/);

            // Remova o que vem antes de "Jarvis"
            array_pergunta.shift();
            
            // Remover o primeiro "Jarvis" do array
            array_pergunta.shift();

            // Unir o restante do array em uma string
            array_pergunta = array_pergunta.join('');

            // Escrevemos no input a pergunta
            resultElement.value = array_pergunta;

            // Pare a captura de voz
            recognition.stop();

            // Consulte a API do OpenAI
            consultarOpenAI(array_pergunta);
        
            restart(recognition);
            
        }
    }); 
}

const restart = (recognition) => {
    // Depois de 1 segundo, reinicie a captura de voz
    setTimeout(() => {
        recognition.start();
        trocarIcone('<i class="fas fa-microphone icon"></i>');
        resultElement.value = "";
    }, 1000);
}

const trocarIcone = (icone) => {
    var startButton = document.getElementById('capture');
    startButton.innerHTML = icone;
}

const reproduzirVoz = (resposta) => {
    var myHeaders = new Headers();
    myHeaders.append("Ocp-Apim-Subscription-Key", microsoftKey);
    myHeaders.append("Content-Type", "application/ssml+xml");
    myHeaders.append("X-Microsoft-OutputFormat", "audio-16khz-128kbitrate-mono-mp3");
    myHeaders.append("User-Agent", "curl");

    var raw = "<speak version='1.0' xml:lang='pt-BR'>\n<voice xml:lang='pt-BR' xml:gender='Female' name='pt-BR-ManuelaNeural'>\n"+resposta+"\n    </voice>\n</speak>";

    var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
    };

    const endpoint = "https://eastus.tts.speech.microsoft.com/cognitiveservices/v1";

    fetch(endpoint, requestOptions)
        .then(response => {
            if (response.ok) {
                return response.arrayBuffer();
            } else {
                throw new Error(`Falha na requisição: ${response.status} - ${response.statusText}`);
            }
        })
        .then(data => {
            const blob = new Blob([data], { type: 'audio/mpeg' });
            const audioUrl = URL.createObjectURL(blob);

            const audioElement = new Audio(audioUrl);
            audioElement.play();
        })
        .catch(error => {
            console.error('Erro:', error);
        });
}

capturarVoz();