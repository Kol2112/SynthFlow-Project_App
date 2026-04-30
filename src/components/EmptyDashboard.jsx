import emptyDashboard from '../assets/emptyDashboard.svg'
export default function EmptyDashboard(){
    return(
        <div id='mainContent'>
            <img src={emptyDashboard} alt="" />
            <h1>It's so empty, right now...</h1>
                            
        </div>
    )
}