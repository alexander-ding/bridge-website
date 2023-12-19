import Footer from '../components/Footer'

export default function ReportPage() {
  return (
    <div className='prose m-auto'>
      <h1>Report</h1>

      <p>
        The following is Bridge's project report, copied mostly verbatim, for
        the assignment. It goes more in depth in the details of how everything
        works and fits together, as well as our design decisions and challenges.
      </p>

      <h2 id='introduction'>Introduction</h2>
      <p>
        Our overall goal is to bridge our IP/TCP stack and the kernel network
        stack in order to implement practical programs against our virtual stack
        that real-world applications can interact with. Specifically, we managed
        to expose virtual network IP addresses to the host system and we were
        able to establish TCP connections between our network stack and the
        kernel stack, as well as across the internet. We found that our IP/TCP
        stack interoperates fully with real-world TCP implementations across
        major kernels, including Windows, Linux, MacOS, Android, and iOS.
        Through this interoperation, we implemented a subset of HTTP 1.1 to spin
        up static and dynamic HTTP servers on our IP/TCP stack to serve
        real-world browser traffic, as well as a netcat clone. Finally, in order
        to more closely simulate the relationship between virtual hosts and
        applications that depend on the networking API on each host, we
        separated the network stack into a virtual kernel service that serves
        virtual network “system calls” from our virtual network applications via
        RPCs.
      </p>
      <h2 id='design-implementation'>Design/Implementation</h2>
      <p>
        What did you build, and how does it work? For this part, give an
        overview of the major components of your system design and how they
        work, similar to what you might write in a readme.
      </p>
      <h3 id='bridging-virtual-stack-to-real-network'>
        Bridging Virtual Stack to Real Network
      </h3>
      <p>
        Our project fundamentally centers around bridging our virtual IP/TCP
        stack with the real network. In our original IP/TCP implementation, all
        network interfaces connecting nodes on our virtual stack were
        implemented as UDP sockets that effectively act as Ethernet links. In
        this project, we add a new type of interface to our link layer
        implementation, known as a “bridge” interface in our implementation (see{' '}
        <code>src/net/ip/link.rs</code> for more information). To bridge a
        virtual network to the real network, one bridge interface is added to
        one router on the virtual network. This interface is responsible for
        forwarding packets on the real host machine that are destined to the
        virtual network to the virtual network, as well as forwarding packets on
        the virtual network destined for the real network to the real network.
      </p>
      <p>
        To do this, simply add a line like the following to the <code>lnx</code>{' '}
        file for the virtual router that should act as a bridge:
      </p>
      <p>
        <code>interface if2 10.7.255.254/0 forward virt0 wlo1 10.7.0.1/13</code>
      </p>
      <p>Where: </p>
      <ol>
        <li>
          <code>if2</code> is the name of the interface that will appear on this
          virtual router (can be any string)
        </li>
        <li>
          <code>10.7.255.244</code> is the IP address of this virtual router
          associated with this virtual interface (can be any IP address within
          the virtual network IP space)
        </li>
        <li>
          <code>/0</code> is the prefix corresponding to traffic that will get
          routed to this interface. This should always be <code>/0</code> for
          bridge interfaces so that by default all traffic destined for the
          internet will get routed to this interface
        </li>
        <li>
          <code>virt0</code> is the name of a dummy interface that will appear
          on the real Linux host machine corresponding to this virtual network
          (can be any name that works as a network interface name under Linux)
        </li>
        <li>
          <code>wlo1</code> is the name of the real network interface for the
          host Linux machine. This should manually be obtained by running{' '}
          <code>ip addr</code> on the real host Linux machine and put into the{' '}
          <code>lnx</code> file accordingly.{' '}
        </li>
        <li>
          <code>10.7.0.1</code> is the IP address assigned to the real host
          Linux machine on our dummy interface (in our case, <code>virt0</code>)
        </li>
        <li>
          <code>/13</code> is the prefix of traffic that corresponds to the
          virtual network. This and the above IP should be chosen manually such
          that all IP addresses on the virtual network are within this prefix.{' '}
        </li>
      </ol>
      <p>
        We modified <code>vnet_generate</code> to automate the generation of
        this bridge interface. You could ask <code>vnet_generate</code> to
        create this bridge interface to the network device <code>eth0</code> via
        some virtual network device by adding a{' '}
        <code>&quot;forward&quot;: &quot;eth0&quot;</code> field to the router
        node&#39;s specification.
      </p>
      <p>
        Once a line like the one explained above is added to the{' '}
        <code>lnx</code> file of the virtual router acting as a bridge, then the
        router will begin bridging traffic on startup. Note that this router
        needs to be run with root permissions (e.g. via <code>sudo</code>) to
        bridge traffic correctly.{' '}
      </p>
      <p>
        Now that we have discussed how to run the bridge, we can discuss how it
        works.{' '}
      </p>
      <p>
        When a bridge interface is enabled on a router, on startup that virtual
        router will enable forwarding by doing the following steps on the real
        Linux host:
      </p>
      <ol>
        <li>Enable forwarding</li>
        <li>
          Create a dummy interface (e.g. <code>virt0</code>)
        </li>
        <li>
          Assign the given IP and prefix (e.g. <code>10.7.0.1/13</code> in the
          above example) to the dummy interface and up the interface
        </li>
        <li>Setup NAT (discussed in the next section)</li>
        <li>
          Start two tasks responsible for forwarding between the real and
          virtual networks (one task for each direction of forwarding)
        </li>
      </ol>
      <p>
        Then, once setup is complete, packets are forwarded between the real and
        virtual networks by this bridge interface. This is accomplished using
        the <code>pnet</code> Rust crate, which effectively allows us to capture
        and send real Linux packets at any network level, including the link
        layer or transport layer levels. The specific mechanics behind this
        bridging process are described below.
      </p>
      <p>
        Forwarding from the virtual network to the real network is handled by
        the <code>run_bridge_sender</code> task (in{' '}
        <code>src/net/ip/link.rs</code>). When a packet on our virtual network
        is destined for the real network/the Internet, it will first be routed
        to the virtual router on our network that is acting as the bridge. Then
        when this router receives the packet, it will be sent down to the link
        layer to be sent out. This is where <code>run_bridge_sender</code>{' '}
        receives the packet. Then, if the virtual interface acting as a bridge
        (e.g. <code>if2</code>) is up, it simply uses the <code>pnet</code>{' '}
        crate to send the raw IP packet constructed by our virtual stack to the
        real IP implementation within the Linux kernel on the host machine. From
        there, the Linux kernel will handle forwarding the packet to its final
        destination.{' '}
      </p>
      <p>
        Forwarding from the real network to the virtual network is handled by
        the <code>run_bridge_receiver</code> task (in{' '}
        <code>src/net/ip/link.rs</code>). When the Linux host machine decides
        that a packet is destined for a host on our virtual stack–that is, when
        the destination IP address is in the prefix associated with the dummy
        interface (e.g. 10.7.0.1/13 in the above example), it will send that
        packet to the dummy interface (e.g. <code>virt0</code>). (In the case of
        a packet from the Internet, NAT will translate the destination address
        to an address in this prefix. More information about this is in the next
        section.) Our <code>run_bridge_receiver</code> task uses the{' '}
        <code>pnet</code> crate to listen to all link layer traffic on this
        dummy interface (e.g. <code>virt0</code>) on the real Linux host. When a
        link-layer packet is detected on this dummy interface,{' '}
        <code>run_bridge_receiver</code> will capture that packet, and send it
        up to the IP layer on the virtual router acting as a bridge to route the
        packet to the proper host on our virtual network.{' '}
      </p>
      <h3 id='port-forwarding-and-nat'>Port Forwarding and NAT</h3>
      <p>
        With the bridging described in the previous section, our virtual network
        can already talk to the real Linux host that is running the virtual
        network. However, for it to talk to the wider Internet, some address
        translation is required to move from the virtual network IP space (e.g.
        10.7.0.1/13) to the IP space of the host Linux machine within the real
        network. When running our virtual IP/TCP stack on a real Linux machine,
        our bridge link will run <code>iptables</code> commands to have the
        Linux kernel provide NAT for us. When running in a Docker container,
        connections initiated by our virtual stack will <em>also</em> go through
        Docker's NAT, which is then forwarded to the real internet.{' '}
      </p>
      <h3 id='abstracting-with-rpcs'>Abstracting with RPCs</h3>
      <p>
        In the previous project, the APIs of our TCP stack could only be called
        as functions if the network stack and the application are compiled into
        a single binary. We need an API for the network stack that can be called
        by other applications that are separate from the network stack. On
        operating systems such as Linux, the network stack runs in kernel space.
        When applications need network functionalities of the system, they make
        system calls to the kernel. However, our stack currently runs in
        user-space. A straightforward idea without us having to work in kernel
        space would be to expose these APIs using RPC. Each host in our virtual
        network runs an RPC service that listens to user requests. Currently,
        the RPC service runs on the same port as the first interface of the
        host, which is janky. The RPC provides a similar interface to the system
        calls in linux, such as <code>tcp_listen</code>,{' '}
        <code>tcp_connect</code> and so on. When the server gets an RPC call, it
        will act accordingly, such as creating a new socket, inserting it into
        the socket table and so on. On the client side, the application that
        creates a socket will get an <code>TcpSocket</code> object, which
        implements drop semantics in which a <code>tcp_close</code> RPC is
        called to ensure clean-up. When an application intends to modify a
        socket through <code>tcp_read</code> or <code>tcp_write</code>, the
        application calls the corresponding RPC, providing the socket id of
        interest to the network service.
      </p>
      <h3 id='netcat'>Netcat</h3>
      <p>
        As a proof-of-concept for the RPC APIs, we built a command-line binary{' '}
        <code>vnc</code> implementing part of the functionalities of{' '}
        <code>netcat</code>, such as listening, accepting, connecting, sending
        and receiving using TCP. The <code>netcat</code> is a standalone binary
        that makes RPC calls to the network stack. Since there could be several
        hosts in the virtual network, <code>vnc</code> accepts an lnx config
        file to specify which host it should run on.
      </p>
      <h3 id='http-server'>HTTP Server</h3>
      <p>
        We built a low-level HTTP server library implementing HTTP 1.1. It takes
        in a TcpListener and a user-defined handler function that transforms
        HTTP requests into HTTP responses. The library accepts TCP connections
        on the listener and parses incoming requests, invoking the handler when
        a valid request has come through. The library appropriately handles
        chunked transfer encodings and keep-alive headers. Upon generating a
        response, the library inserts sensible response headers and serializes
        the response to send over the TCP socket to the other side.
      </p>
      <h3 id='simple-http-file-server'>Simple HTTP File Server</h3>
      <p>
        Using the core HTTP server library, we built a simple static HTTP file
        server <code>file_server</code> that serves a directory of static files.
        It appropriately handles index.html defaults and tries to populate the
        content type by automatically deducing the mime of the response body.
      </p>
      <h3 id='echo-server-and-post-server'>Echo Server and Post Server</h3>
      <p>
        To demonstrate the core HTTP server library's ability to generate
        dynamic content and handle POST requests, we also built an echo server
        that responds to POST requests with the body of the POST request and a
        post server that serves an HTTP form and a text box that is dynamically
        determined by the last submitted form value.
      </p>
      <h3 id='containerization'>Development Container</h3>
      <p>
        As our project now has additional requirements (protobuf and iptables),
        we rolled our own development container and gave detailed set-up
        instructions so that anyone can try the project out.
      </p>
      <h3 id='public-deployment'>Public Deployment</h3>
      <p>
        We forked Alex&#39;s personal website to create a{' '}
        <a href='https://alexding.me/bridge'>website</a> to document this
        project (
        <a href='http://github.com/alexander-ding/bridge-website'>source</a>).
        We packaged up <code>file_server</code> and <code>post_server</code>{' '}
        into a small deployment container to run on a public cloud platform
        (Google Cloud Platform) to serve this website to the internet.
      </p>
      <h2 id='discussion-results'>Discussion/Results</h2>
      <p>
        Describe any results you have, what you have learned, and any challenges
        you faced along the way. For this part, please include any relevant
        logs/screenshots of your program operating (and/or reference your demo
        video).
      </p>
      <h3 id='results'>Results</h3>
      <p>
        We can successfully serve an HTTP page from across the Brown network
        (and in fact across the internet). We downloaded the CS1680 website from
        the department filesystem and hosted it on our virtual stack. Below is
        an HTTP server that is running on top of a virtual host on our virtual
        network:
      </p>
      <p>
        <img
          class='w-full'
          src='/assets/file-server.png'
          alt='File server running in command line'
        />
      </p>
      <p>
        and the virtual node providing TCP API calls to the HTTP server via RPC:
      </p>
      <p>
        <img
          class='w-full'
          src='/assets/sockets.png'
          alt='Sockets printed in command line'
        />
      </p>
      <p>
        and another one of our group members, running on a{' '}
        <em>different computer</em> on the Brown network, connecting to the
        server in their <em>real browser</em>:
      </p>
      <p>
        <img
          class='w-full'
          src='/assets/browser.png'
          alt='Browser visiting our stack'
        />
      </p>
      <p>
        Similarly, we can use our virtual stack nc (<code>vnc</code>) to send
        and receive data over the real network. See our demo video for more on
        this!
      </p>
      <p>
        Additionally, our vhost TCP over RPC API is designed to mimic the
        regular TCP API, allowing us to plug and play the same binary between
        the two implementations with a simple import statement change. Given
        more time, we would have implemented an abstracted TCP API and have both
        versions implement the API to write completely generic TCP applications.
      </p>
      <h3 id='bridging-nat-difficulties'>Bridging/NAT Difficulties</h3>
      <p>
        We had many difficulties during the process of getting bridging to work
        initially. For a while we had difficulties due to limited documentation
        on iptables and raw sockets/libraries for managing raw sockets. This led
        to us having many designs over time with bridging. For instance, our
        earliest design simply listened to <em>all</em> packets on the Linux
        host's real network interface, filtering out packets with specific ports
        to forward to our virtual stack. After a lot of research and iterating,
        we learned more fully how to use iptables and the <code>pnet</code>{' '}
        crate, allowing us to come to our final design of modeling the bridge
        simply as an interface on a virtual router.{' '}
      </p>
      <p>
        Another difficulty we ran into was with regard to the handling of
        checksums. Initially we were forwarding packets directly from the real
        network to our stack. This works in the case that we are running
        natively on a Linux host and when the packets are coming from the
        Internet. However, when packets originate from loopback on the Linux
        host, the TCP checksum is never computed. Similarly, when running in a
        Docker container, Docker's NAT will not recompute the checksum for us,
        causing the TCP checksum to be invalid. To circumvent this, our bridge
        interface on the virtual router will simply recompute the TCP checksum
        on incoming packets before forwarding to the virtual network.{' '}
      </p>
      <h3 id='limitations-of-rpcs'>Limitations of RPCs</h3>
      <p>
        The RPC APIs work well in terms of functionality, however it has
        limitations. Since it adds an extra layer of abstraction and incurs more
        network traffic (thus more copying), its performance is expected to be
        worse than our previous implementation, where applications (
        <code>vhost</code>) and the network stack are compiled into the same
        binary and applications make direct function calls. If we had more time,
        we could do a performance benchmark and compare the two implementations.
        Moreover, the RPC APIs introduce a security problem: anyone who could
        reach localhost could control the network stack on any virtual host in
        the virtual network. Our RPC APIs remind us of microkernel operating
        systems, where applications send <code>messages</code> to the network
        stack running in userspace. However, in microkernels OSes,
        authorizations checks could be done when messages pass through the
        kernel, ensuring that sockets could only be modified by processes that
        own the socket. To protect sockets that have been created from
        unauthorized modifications, a straightforward solution would be to
        return a randomly-generated token to the application (instead of a
        socket id, which could be easily guessed by an attacker). However, to
        prevent unauthorized attackers from creating sockets (through{' '}
        <code>tcp_listen</code>, <code>tcp_accept</code> and{' '}
        <code>tcp_connect</code>), it is likely that authentication needs to be
        implemented such that the network service could identify whether an RPC
        call is from an authorized user. Finally, RPC has maximum request and
        response sizes, meaning that a large enough read or write call would
        exceed the limit. This is especially problematic for HTTP servers, which
        regularly make write API calls with large files. This can be
        circumvented by splitting up the API calls with smaller write calls but
        adds more usage difficulties for the user.
      </p>
      <h3 id='closing-sockets-via-rpc'>Closing Sockets via RPC</h3>
      <p>
        As mentioned before, our RPC TCP API is designed to have the same
        semantics as the regular TCP API. Thus, when dropping an RPC TcpSocket
        or TcpListener, a close RPC request is sent to the vhost daemon.
        However, as drop cannot be blocking, drop only spins up a thread to
        asynchronously send the request. Without explicit work elsewhere, the
        main thread can shut down the entire tokio runtime before these async
        requests are fired, causing sockets and listeners to be orphaned on the
        daemon. The solution is to add an asynchronously waiter on the TCP API
        object that waits until all queued close requests are sent, and all
        binaries the RPC TCP API need to be careful to wait for this waiter to
        return before exiting the binary.
      </p>
      <h2 id='conclusions-future-work'>Conclusions/Future work</h2>
      <p>
        This was a wild ride, and we absolutely loved it. The project started
        out with a simple idea–implement a simple HTTP server on top of our
        IP/TCP stack and serve it to a real browser with an ad hoc proxy binary
        that forwards packets–and it kept ballooning up in scope as we
        generalized our ideas further and further. We wanted to generalize the
        proxy binary into a virtual home router that uses NAT to multiplex a
        single real-world IP address on the host machine (akin to a single IP
        address of a home router on the internet) against a fleet of vhosts, and
        Liz figured out that we could do this natively in Linux using IP table
        configuration. Then, we realized that we didn't have to stop with an
        HTTP server; we had a whole network stack that could interface with any
        system on the whole internet, so we set out to build a Linux-like
        ecosystem of tools against the stack and made a netcat clone. At this
        point, Weili observed that vhost should really be more like a virtual
        kernel that serves network-related syscalls from client applications,
        which we decided to implement with RPCs. We refactored the TCP stack
        into an RPC service, and now multiple client applications, such as a
        netcat and an HTTP server, can simultaneously open connections on the
        same IP address at different ports, much like how real userland programs
        share the same kernel. There were plenty of challenges. In scope, this
        was one of the largest projects we worked on at Brown, and there was a
        lot of complexity in structuring and designing APIs and abstraction
        layers that interface with each other nicely. Concurrency was very hard
        to get right, as well as correctness in various edge cases. RFCs are
        often too long to parse through efficiently, and there were lots of
        little hiccups and gotchas with the way the network worked in real OSes.
        Each of these challenges forced us to learn a little more about the
        network and software engineering. There are a lot directions where we
        can take this project further:
      </p>
      <ol>
        <li>
          Abstract the RPC and regular TCP implementation into a generic TCP
          trait that both versions implement. Expand the set of TCP APIs.
        </li>
        <li>
          Improve the HTTP library to support the entirety of HTTP 1.1's spec,
          especially providing a low-level HTTP client library.
        </li>
        <li>
          Build a set of more ergonomic HTTP client and server libraries that
          more closely resemble modern solutions (Express in NodeJS, for
          example, and requests in Python)
        </li>
        <li>Implement TLS</li>
        <li>Build more clones of command line network tools</li>
        <li>Benchmark the performance of our stack</li>
      </ol>
      <p>
        But yeah, it's been a good run. Sorry for the really long write-up. Hope
        you like our project!
      </p>

      <Footer />
    </div>
  )
}
