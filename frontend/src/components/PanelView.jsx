import '../styles/PanelView.css'
import ProjectBoard from "./ProjectBoard.jsx"
export default function PanelView({headerTitle, content}){
    return(
    <section className='panelViewContainer'>
            <div id='headerSection'>
                <h1>{headerTitle}</h1>
                <div id='horizontalLine'></div>
            </div>
           {content}
        </section>
    )
}