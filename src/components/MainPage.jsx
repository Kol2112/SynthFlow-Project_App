import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';

import '../styles/MainPage.css'
import emptyDashboard from '../assets/emptyDashboard.svg'

export default function MainPage(){
    return(
        <>
            <Navbar />
            <main>
                <Sidebar />
                <div id='mainContent'>
                    <img src={emptyDashboard} alt="" />
                    <h1>It's so empty, right now...</h1>
                </div>
            </main>
        </>
    )
}