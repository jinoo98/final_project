import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send } from 'lucide-react';

const AIChatModal = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState([
        { id: 1, text: "안녕하세요! **AI 고객센터**입니다. 무엇을 도와드릴까요? 모임 일정이나 회비에 대해 궁금한 점이 있으시면 말씀해주세요.", isUser: false }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const formatMessage = (text) => {
        return text.split('\n').map((line, i) => (
            <span key={i}>
                {line}
                <br />
            </span>
        ));
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { id: Date.now(), text: input, isUser: true };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const apiUrl = '/api/ask_momo/';
            const body = { question: input };

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                const data = await response.json();
                const aiResponse = { id: Date.now() + 1, text: data.answer, isUser: false };
                setMessages(prev => [...prev, aiResponse]);
            } else {
                console.error('AI Server Error:', response.status);
                const errorResponse = { id: Date.now() + 1, text: "죄송합니다. 오류가 발생했습니다. 잠시 후 다시 시도해주세요.", isUser: false };
                setMessages(prev => [...prev, errorResponse]);
            }
        } catch (error) {
            console.error('Network Error:', error);
            const errorResponse = { id: Date.now() + 1, text: "서버와 연결할 수 없습니다.", isUser: false };
            setMessages(prev => [...prev, errorResponse]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] md:h-[600px] flex flex-col overflow-hidden overscroll-contain">
                <div className="flex items-center justify-between p-4 md:p-6 border-b border-border bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 transition-colors bg-primary">
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="font-bold truncate text-sm md:text-base">
                                AI 고객센터
                            </h2>
                            <p className="text-xs md:text-sm text-muted-foreground truncate">
                                MOMO 서비스에 대해 물어보세요
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2">
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>
                <div className="flex-1 p-4 md:p-6 flex flex-col min-h-0">
                    <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                                <div className={`p-4 rounded-xl max-w-[85%] md:max-w-[80%] ${msg.isUser ? 'bg-primary text-white' : 'bg-blue-50 text-gray-900'}`}>
                                    <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-blue-50 p-4 rounded-xl">
                                    <div className="flex space-x-2">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="flex gap-2 items-center">
                        <input
                            type="text"
                            placeholder="메시지 입력…"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={isLoading}
                            className="flex-1 min-w-0 px-4 py-3 bg-gray-50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm md:text-base disabled:opacity-50"
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading}
                            className="flex-shrink-0 p-3 md:px-6 md:py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm md:text-base disabled:opacity-50"
                        >
                            <span className="hidden md:inline">전송</span>
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIChatModal;
