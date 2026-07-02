import PriorityDots from './utils/PriorityDots.jsx'
import '../styles/ComingTasks.css'

export default function ComingTasks(){
    return(
        <section id='taskPanelContainer'>
            <div id='taskPanelHeader'>
                <span>Task</span>
                <span>Project</span>
                <span>Assignee</span>
                <span>Complete</span>
                <span>Priority</span>
                <span>Deadline</span>
            </div>
            <div className='taskElement'>
                <p>Create UI</p>
                <p>SynthFlow</p>
                <p>Dawid</p>
                <span>52%</span>
                <PriorityDots />
                <p>25-10-2026</p>
                <button>Details</button>
            </div>
            <div className='taskElement'>
                <p>Create UI</p>
                <p>SynthFlow</p>
                <p>Dawid</p>
                <span>52%</span>
                <PriorityDots />
                <p>25-10-2026</p>
                <button>Details</button>
            </div>
            <div className='taskElement'>
                <p>Create UI</p>
                <p>SynthFlow</p>
                <p>Dawid</p>
                <span>52%</span>
                <PriorityDots />
                <p >25-10-2026</p>
                <button>Details</button>
            </div>

        </section>
    )
}