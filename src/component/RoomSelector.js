const RoomSelector = ({ selectRoom }) => {
    const handleSubmit = (e) => {
        e.preventDefault();

        const value = document.getElementById('roomIdInput').value;

        const match = value.match(/[0-9]+/);
        if(!(match && value === match[0])){
            return;
        }

        selectRoom(value);
    }

    return (
        <form className='Wrapper' id='roomSelector' onSubmit={ handleSubmit }>
            <input type='text' id='roomIdInput' placeholder={'Enter room id here'}/>
            <input type='submit' id='roomIdBtn' value='Go'/>
        </form>
    );
};

export default RoomSelector;