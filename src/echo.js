import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: '2cbf7ed2f95e10bc18c7', 
    cluster: 'ap1',             
    forceTLS: true,
    

    // Đường dẫn API xác thực của Laravel 
    authEndpoint: 'https://hrm-backend-iybp.onrender.com/api/broadcasting/auth', 
    auth: {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`, 
        },
    },
    // ---------------------------------------
});

export default window.Echo;