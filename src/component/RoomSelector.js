const { useState } = require('react');

const RoomSelector = ({ selectRoom }) => {
    const [ roomId, setRoomId ] = useState('12705627');

    const handleSubmit = (e) => {
        e.preventDefault();

        const match = roomId.match(/[0-9]+/);
        if(!(match && roomId === match[0])){
            return;
        }

        selectRoom(roomId);
    }

    const handleChange = (e) => {
        setRoomId(e.target.value);
    }

    return (
        <form className='Wrapper' id='roomSelector' onSubmit={ handleSubmit }>
            <input type='text' id='roomIdInput' placeholder={'Enter room id here'} value={ roomId } onChange={ handleChange }/>
            <input type='submit' id='roomIdBtn' value='Go'/>
        </form>
    );
};

export default RoomSelector;