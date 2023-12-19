
import Footer from '../components/Footer'

export default function HomePage() {

  return (
    <div className='prose m-auto'>
      <h1>
        Bridge
        <p className='text-size-0.5em font-500'>
          is an RFC-compliant userland IP/TCP/HTTP implementation built in Rust that runs through UDP sockets to create a virtual network.
        </p>
      </h1>
      <div>
        <p>(Yes, this website is being served by through a custom HTTP server, running on a custom IP/TCP network stack, interfacing with the real internet; it is also perfectly capable of handling{' '}
          <a target='_blank' href='/post-request'>post requests</a> and <a target='_blank' href='/http-lecture.pdf'>large files</a>)
        </p>
        <p>
          Throughout the course of Brown University's <a target='_blank' href='https://cs.brown.edu/courses/csci1680/f23/'>CSCI 1680: Computer Networks</a> during fall 2023, we implemented IPv4 (per <a target='_blank' href='https://www.rfc-editor.org/rfc/rfc791'>RFC 791</a>) and TCP (per <a target='_blank' href='https://datatracker.ietf.org/doc/html/rfc9293'>RFC 9293</a>) to support a virtual network that runs on the same host machine and talks through UDP sockets, as shown in these <a target='_blank' href='https://brown-csci1680.github.io/iptcp-docs/'>assignment</a> <a target='_blank' href='https://brown-csci1680.github.io/iptcp-docs/tcp-handout'>handouts</a>.
        </p>
        <p>
          As the final project, we bridged this virtual network with the real kernel network stack to interface with real-world networking applications using a combination of Linux iptables settings and a custom proxy thread to relay packets between a dummy Linux network interface and the virtual network.
          Moreover, we abstracted each virtual host into a microkernel that serves networking "syscalls" via RPC, allowing multiple applications to use the same virtual IP address simultaneously just as they would on a real host.
          We also implemented the core functionalities of HTTP 1.1 (per <a target='_blank' href='https://datatracker.ietf.org/doc/html/rfc9110'>RFC 9110</a>) to spin up HTTP servers against this custom network stack.
          As shown in our <a target='_blank' href='https://www.youtube.com/watch?v=E2NQlRVIX6Q'>demo video</a>, we used Bridge to build a variety of networking applications on this custom network stack--including a netcat clone, a static HTTP file server, and a dynamic HTTP file server serving POST requests--to interface with themselves, as well as other real-world networking applications across the internet.
        </p>
        <p>
          From there, we containerized the whole virtual network stack and deployed it on Google Cloud to use our custom HTTP server to serve public internet traffic.
          This server had just responded your browser's network request and sent back the content of this website, which is what is allowing you to read this page on your browser right now.
        </p>
        <p>
        </p>
        <p>
          When a TCP packet comes in addressed to a port forwarded by our virtual stack (i.e., port 80, used by this server), Linux sends the packet to a virtual network device created by our virtual router proxy.
          The virtual router proxy, listening for traffic on the virtual network device, forwards the byte stream to our virtual network stack.
          Our custom IP layer then parses the byte stream and forwards the datagram from the virtual router to the appropriate virtual host using its internal IP table.
          On the virtual host, our custom TCP layer then parses the body of the datagram to appropriately handle the TCP packet.
          Our custom HTTP server, running on top of this TCP implementation, makes IO function calls to the TCP socket, parsing HTTP requests and sending back HTTP responses according to an application-registered HTTP handler.
          Importantly, the virtual host runs as an RPC server, and the application's TCP-related system calls (e.g., read and write) are done via RPC calls in order to allow multiple applications to use the same virtual host.
          This enables us to host both the static HTTP server and the dynamic HTTP server on two different ports of the same virtual IP address.
        </p>
        <p>
          If you're interested in learning more about Bridge, check out the <a href='/post-request'>post request demo</a>, <a href='/report'>project report</a>, <a target='_blank' href='https://www.youtube.com/watch?v=E2NQlRVIX6Q'>demo video</a>, and <a target='_blank' href='https://github.com/alexander-ding/bridge-website'>GitHub repository</a>.
        </p>
      </div>
      <Footer />
    </div>
  )
}
