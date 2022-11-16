import "./header.css"

const Network = (props) => {
    if(props.currentNetwork){
        return (
            <div className=""> 
                <div>
                  Network: {props.currentNetwork}
                </div>
            </div>
        )
    }else{
        return <></>
    }
    
}

export default Network
