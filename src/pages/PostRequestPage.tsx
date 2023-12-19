import Footer from '../components/Footer'

export default function PostRequestPage() {
    return (
        <div className='prose m-auto'>
            <h1>Sending Post Requests</h1>
            <p>
                Below you can find an iframe embedding pointing to the HTTP server running on port 1000 of the same IP address as this server.
                This iframe demonstrates our stack's ability to serve POST requests.
                The server maintains a single global message to be displayed on the website upon visit, and the form allows any user to set the message on the board via a post request.
            </p>

            <p>
                (There are some obvious ways to attack this post server; so please don't do so. On the other hand, I do think it's safe against XSS, so you're welcome to try.)
            </p>

            <iframe src="http://127.0.0.1:1000" width="100%" height="500di">

            </iframe>

            <Footer />
        </div>
    )
}
