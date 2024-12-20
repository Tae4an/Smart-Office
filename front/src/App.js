import { Suspense } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import AppRoutes from './Routes';
import ChatWidget from './components/ai/ChatWidget';
import './styles/global.css';
import './styles/pages.css';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Suspense fallback={
                <div className="loading"/>
            }>
                <AppRoutes />
                <ChatWidget />
            </Suspense>
        </ThemeProvider>
    );
}

export default App;