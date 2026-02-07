import { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { MeetingListPage } from './components/MeetingListPage';
import { MeetingDashboard } from './components/MeetingDashboard';
import { MyPage } from './components/MyPage';
import { AIAssistant } from './components/AIAssistant';

type Page = 'login' | 'meetingList' | 'meetingDetail' | 'myPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  const handleLogin = () => {
    setCurrentPage('meetingList');
  };

  const handleLogout = () => {
    setCurrentPage('login');
    setSelectedMeetingId(null);
  };

  const handleSelectMeeting = (meetingId: string) => {
    setSelectedMeetingId(meetingId);
    setCurrentPage('meetingDetail');
  };

  const handleOpenSettings = () => {
    setCurrentPage('myPage');
  };

  const handleBackToMeetingList = () => {
    setCurrentPage('meetingList');
    setSelectedMeetingId(null);
  };

  const handleOpenAI = () => {
    setShowAIAssistant(true);
  };

  const handleCloseAI = () => {
    setShowAIAssistant(false);
  };

  return (
    <>
      {currentPage === 'login' && <LoginPage onLogin={handleLogin} />}
      
      {currentPage === 'meetingList' && (
        <MeetingListPage
          onSelectMeeting={handleSelectMeeting}
          onOpenSettings={handleOpenSettings}
          onLogout={handleLogout}
        />
      )}
      
      {currentPage === 'meetingDetail' && (
        <MeetingDashboard
          onBack={handleBackToMeetingList}
          onOpenAI={handleOpenAI}
        />
      )}
      
      {currentPage === 'myPage' && (
        <MyPage onBack={handleBackToMeetingList} />
      )}
      
      {showAIAssistant && <AIAssistant onClose={handleCloseAI} />}
    </>
  );
}