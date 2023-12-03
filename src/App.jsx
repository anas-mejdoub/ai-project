import { useEffect, useState, useRef  } from 'react'
import './App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';
import { v4 as uuidv4 } from 'uuid';


const API_KEY = "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";
const systemMessage = { 
  "role": "system", "content": "explain like i am 5 years old"
}
const ChatList = ({ setActiveChat, history }) => {
  
  const handleClick = () =>{
    let id = localStorage.getItem('id');
    id = id ? JSON.parse(id) : 0;
    localStorage.setItem('id', Number(id))
  }
  return (
    <div className="chat-list">
      {history.length}

        <div
          className="chat-list-item"
          onClick={handleClick}
        >
          New Chat
        </div>
        {history.map((h,i) => ((Number(h.id) % 2) ===0 ?  (<div
          className="chat-list-item"
          key={i}
          onClick={handleClick}
        >
          chat-{i == 0 ? 0 : i - i/2}
        </div>) : null))}
    </div>
  );
};

function App() {

  // useEffect(() => {
  //   const handleBeforeUnload = (event) => {
  //     // Cancel the event to prevent the page from being unloaded
  //     event.preventDefault();
  //     // Chrome requires returnValue to be set
  //     event.returnValue = '';
  //   };

  //   // Attach the event listener
  //   window.addEventListener('beforeunload', handleBeforeUnload);

  //   // Cleanup the event listener when the component unmounts
  //   return () => {
  //     window.removeEventListener('beforeunload', handleBeforeUnload);
  //   };
  // }, []);
  const [activeChat, setActiveChat] = useState('ChatGPT');
  const [messages, setMessages] = useState([
    {
      message: "",
      sentTime: "just now",
      sender: "ChatGPT"
    }
  ]);
  const [history, sethistory] = useState(JSON.parse(localStorage.getItem('history')) || [{id :0, chat: messages}]);

  const [isTyping, setIsTyping] = useState(false);
  useEffect(() => {
    let id = localStorage.getItem('id');
    id = id ? JSON.parse(id) : 0;
    
    let updatedHistory = history.map((entry) =>
      entry.id === id ? { id: entry.id, messages } : entry
    );
    if (!updatedHistory.some((entry) => entry.id === id)) {
      updatedHistory = [...updatedHistory, { id, messages }];
    }
    sethistory(updatedHistory);
    localStorage.setItem('history', JSON.stringify(history));
    localStorage.setItem('id', JSON.stringify(id));
  }, [messages]);
  useEffect(() =>{
    let id = localStorage.getItem('id');
    id = id ? JSON.parse(id) : 0;
    console.log(id)
    if (history[0].messages)
    {
      localStorage.setItem('id', JSON.stringify(Number(id + 1)));
    }
  },[])
  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: 'outgoing',
      sender: "user"
    };
  let newMessages;
    if (!messages[0].message)
    {
        newMessages = [newMessage];
    }
    else
    {
        newMessages = [...messages, newMessage];
    }
    setMessages(newMessages);
    setIsTyping(true);
    await processMessageToChatGPT(newMessages);
  };

  async function processMessageToChatGPT(chatMessages) {
    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message}
    });


    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        systemMessage,  
        ...apiMessages
      ]
    }

    await fetch("https://api.openai.com/v1/chat/completions", 
    {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)
    }).then((data) => {
      return data.json();
    }).then((data) => {
      setMessages([...chatMessages, {
        message: data.choices[0].message.content,
        sender: "ChatGPT"
      }]);
      setIsTyping(false);
    });
  }

  return (
    <div className="App">
      <div className="chat-sidebar">
        <ChatList setActiveChat={setActiveChat} history={history} />
      </div>
      { !messages[0].message ? <div style={{width: "1000px",  height: "550px",background: '#47476b', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'}}>
        <h2 style={{textAlign:'center', position:'relative', top:'40%'}}>How can I help you today?</h2>
        <MessageInput style={{position:'relative', top:'79%'}} placeholder="Message chatGPT..." onSend={handleSend} />

      </div> 
       : <>
        <div style={{ position:"fixed", right:"0%", top : 0, height: "550px", width: "1000px"}}>
        <MainContainer style={{}}>
          <ChatContainer style={{ background: '#47476b', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)' }}>       
            <MessageList 
              style={{ background: '#47476b', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)' }}
              scrollBehavior="smooth"
              typingIndicator={isTyping ? <TypingIndicator style={{ background: '#47476b'}} content="ChatGPT is typing" /> : null}
              >
              {messages.map((message, i) => {
                return <Message style={{textAlign : 'left',background:''}} key={i} model={message} />
              })}
            </MessageList>
            <MessageInput placeholder="Message chatGPT..." onSend={handleSend} />        
          </ChatContainer>
        </MainContainer>
      </div>
          </>
            }
    </div>
  )
}

export default App
