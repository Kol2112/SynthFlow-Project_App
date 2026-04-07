
export default function CreateProject(){
    return(
        <div>
            <form action="">
                <div className="leftColumn">
                    <label htmlFor="">Project Name</label>
                    <input type="text" placeholder='e.g SynthFlow'/>
                    <label htmlFor="">Project Key</label>
                    <input type="text" placeholder='SNF-50'/>
                    <label htmlFor=""></label>
                    <textarea name="" id=""></textarea>

                </div>
                <div className="rightColumn">
                    <label htmlFor="">Deadline date</label>
                    <input type='date' name="" id=""/>
                    <label htmlFor="">Add members</label>
                    <p>Users</p>
                    <label htmlFor="">Project priority</label>
                    <div className="projectPriorityButtons">
                        <button>Low</button>
                        <button>Medium</button>
                        <button>High</button>
                        <button>Critical</button>
                    </div>
                    <label htmlFor="">Tags</label>
                    <input type="text" name="" id="" placeholder="Please seperate tags with ;"/>
                </div>
            </form>
        </div>
    )
}