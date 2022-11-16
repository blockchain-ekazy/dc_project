
const EtherBalance = (props) => {
    if(props.balance){
        return (
            <div className="tac">
                Balance: {props.balance}
            </div>
        )
    }else{
        return (
            <></>
        )
    }
    
}

export default EtherBalance
