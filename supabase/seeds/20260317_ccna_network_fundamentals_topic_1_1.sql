delete from public.lessons
where module_id = (
  select id
  from public.modules
  where slug = 'network-fundamentals'
    and course_id = (
      select id
      from public.courses
      where slug = 'ccna-200-301-preparation'
    )
)
and slug in ('osi-and-tcpip-models', 'ipv4-ipv6-addressing-basics');

insert into public.lessons (
  module_id,
  title,
  slug,
  summary,
  content,
  order_index,
  estimated_minutes,
  video_url
)
select
  m.id,
  l.title,
  l.slug,
  l.summary,
  l.content,
  l.order_index,
  l.estimated_minutes,
  l.video_url
from public.modules m
join (
  values
    (
      $$network-fundamentals$$,
      $$Network Devices and Their Roles$$,
      $$network-devices-and-their-roles$$,
      $$Understand the main job of endpoints, switches, routers, servers, and firewalls in a simple network.$$,
      $$## Simple Explanation

A network is a group of connected devices that share information and services. Some devices create or receive data, and some devices help move that data to the right place. For the CCNA exam, you should know what each major network component does and why it matters.

## Key Concepts

- A network allows connected devices to communicate.
- A node is any device connected to the network.
- End hosts, also called endpoints, are the source or destination of data.
- A client requests a service, such as opening a website.
- A server provides a service, such as sending a web page back to the client.
- A switch connects devices inside the same LAN and forwards frames using MAC addresses.
- A router connects different networks and forwards packets using IP addresses.
- A firewall filters traffic according to security rules.
- A next-generation firewall adds deeper inspection and extra security features.

## Important Points for the CCNA Exam

- Switches are mainly used for communication inside the same local network.
- Routers are used when traffic must move between different networks.
- MAC addresses are important for switching decisions.
- IP addresses are important for routing decisions.
- Firewalls are security devices, not just forwarding devices.

## Real World Example

In a branch office, employee laptops connect to a switch. The switch connects to a router, and the router connects the office to the internet. A firewall can sit between the office and the internet to block unwanted traffic. If a user opens a cloud app, the laptop is the client and the cloud system is the server.

## Quick Review

- Endpoints create and receive data.
- Switches move traffic inside a LAN.
- Routers move traffic between networks.
- Firewalls protect the network by filtering traffic.

## Key Terms

- Network
- Node
- End host
- Endpoint
- Client
- Server
- Switch
- Router
- Firewall
- Next-generation firewall

## Mini Practice Questions

1. Which device mainly forwards traffic inside the same LAN?
2. Which device mainly forwards packets between different networks?$$,
      1,
      14,
      'https://www.youtube.com/watch?v=H8W9oMNSuwo'
    ),
    (
      $$network-fundamentals$$,
      $$Packet Tracer Basics$$,
      $$packet-tracer-basics$$,
      $$Learn how Packet Tracer helps you practice Cisco networking without needing real hardware.$$,
      $$## Simple Explanation

Cisco Packet Tracer is a simulation tool used to practice networking on your computer. It lets you build small or large topologies, connect devices together, and test commands before working on real hardware. It is one of the most useful practice tools for CCNA students.

## Key Concepts

- Packet Tracer simulates common Cisco devices.
- You can add routers, switches, PCs, firewalls, and other devices to a topology.
- Devices can be connected with virtual cables.
- Many devices can be configured through the CLI.
- It is a safe place to practice labs and troubleshooting steps.

## Important Points for the CCNA Exam

- Packet Tracer is widely used for CCNA study and lab practice.
- It helps you practice CLI commands and connectivity testing.
- It is not identical to real hardware, but it is good for learning core concepts.
- You should be comfortable opening devices, connecting them, and using the CLI.

## Real World Example

If you want to practice router interfaces, switch VLANs, or basic IP addressing, you can build the topology in Packet Tracer first. That lets you make mistakes, fix them, and repeat the lab without touching production hardware.

## Quick Review

- Packet Tracer is a simulation and practice tool.
- It supports topology building and CLI work.
- It is useful for CCNA labs and troubleshooting practice.

## Key Terms

- Packet Tracer
- Topology
- Simulation
- CLI
- Lab practice

## Mini Practice Questions

1. Why is Packet Tracer useful for a CCNA student?
2. What is one major way Packet Tracer helps with lab practice?$$,
      2,
      10,
      'https://www.youtube.com/watch?v=a1Im6GYaSno'
    ),
    (
      $$network-fundamentals$$,
      $$Wireless Access Points$$,
      $$wireless-access-points$$,
      $$See how access points let wireless devices join the network and reach the wired LAN.$$,
      $$## Simple Explanation

An access point, or AP, gives wireless devices a way to connect to the network. It acts like the wireless entry point into the LAN. Without access points, laptops, tablets, and phones would not be able to join the network over Wi-Fi.

## Key Concepts

- An access point provides wireless connectivity.
- It connects wireless clients to the wired network.
- Wireless users still need normal network services like IP addressing and routing.
- Access points are common in offices, schools, and public spaces.

## Important Points for the CCNA Exam

- AP stands for access point.
- Access points connect wireless users to the network.
- Wireless networks are still part of the same larger IP network design.
- You should be able to describe an AP in simple terms on the exam.

## Real World Example

In a classroom, students connect laptops to Wi-Fi. The access point in the room sends their traffic into the wired school network so they can reach learning platforms and cloud services.

## Quick Review

- An AP provides Wi-Fi access.
- It links wireless devices to the rest of the network.
- It is a key part of wireless network design.

## Key Terms

- Access Point
- AP
- Wireless client
- Wi-Fi
- Wired network

## Mini Practice Questions

1. What is the main role of an access point?
2. Do wireless clients connect directly to the wired LAN without an AP in a normal enterprise Wi-Fi design?$$,
      3,
      9,
      'https://www.youtube.com/watch?v=uX1h0F6wpBY'
    ),
    (
      $$network-fundamentals$$,
      $$Wireless LAN Controllers$$,
      $$wireless-lan-controllers$$,
      $$Understand how lightweight access points are centrally managed through a wireless controller.$$,
      $$## Simple Explanation

A wireless LAN controller, or WLC, manages lightweight access points from one central location. Instead of configuring every AP separately, an administrator can control many APs from the controller. This makes wireless networks easier to manage at scale.

## Key Concepts

- A WLC centrally manages lightweight APs.
- Autonomous APs are managed one by one.
- Lightweight APs are usually managed by a controller.
- Lightweight APs use CAPWAP tunnels to communicate with the WLC.

## Important Points for the CCNA Exam

- Know the difference between autonomous APs and lightweight APs.
- Know that lightweight APs are associated with controller-based wireless design.
- Know that CAPWAP is used between lightweight APs and the WLC.

## Real World Example

A business with dozens of access points across multiple floors can use one WLC to push settings, security policies, and updates across the wireless network instead of logging in to each AP separately.

## Quick Review

- A WLC manages lightweight APs.
- CAPWAP is used between lightweight APs and the controller.
- Centralized management is useful in larger environments.

## Key Terms

- WLC
- Wireless LAN Controller
- Autonomous AP
- Lightweight AP
- CAPWAP

## Mini Practice Questions

1. What is the benefit of using a WLC with lightweight APs?
2. What protocol is commonly used between a lightweight AP and its controller?$$,
      4,
      10,
      'https://www.youtube.com/watch?v=uX1h0F6wpBY'
    ),
    (
      $$network-fundamentals$$,
      $$TCP/IP Model Basics$$,
      $$tcp-ip-model-basics$$,
      $$Learn the five TCP/IP layers and how data is encapsulated as it moves through the network.$$,
      $$## Simple Explanation

The TCP/IP model explains how data moves from one device to another. It organizes communication into layers so each layer has a clear job. This helps network engineers understand protocols, troubleshoot problems, and explain how traffic moves across a network.

## Key Concepts

- Protocols are the rules devices use to communicate.
- Standards help equipment from different vendors work together.
- The TCP/IP model has five layers.
- The Application layer supports communication between applications.
- The Transport layer uses TCP or UDP.
- The Internet layer uses IP for routing between networks.
- The Data Link layer handles local delivery with MAC addresses.
- The Physical layer sends bits over cables or wireless signals.
- Encapsulation adds headers as data moves down the stack.
- Decapsulation removes headers at the receiving side.

## Important Points for the CCNA Exam

- Know the five TCP/IP layers in order.
- Know examples such as HTTP at the Application layer and IP at the Internet layer.
- Understand the difference between local delivery and routed delivery.
- Understand encapsulation and decapsulation clearly.

## Real World Example

When you open a website, the browser creates application data, TCP manages reliable delivery, IP handles addressing and routing, the Data Link layer handles local forwarding, and the Physical layer sends the bits on the medium.

## Quick Review

- TCP/IP has five layers.
- Each layer has a specific role.
- Encapsulation happens before sending.
- Decapsulation happens after receiving.

## Key Terms

- Protocol
- Standard
- Application layer
- Transport layer
- Internet layer
- Data Link layer
- Physical layer
- Encapsulation
- Decapsulation

## Mini Practice Questions

1. Which TCP/IP layer is responsible for routing packets between networks?
2. What happens during encapsulation?$$,
      5,
      14,
      'https://www.youtube.com/watch?v=yM-XNq9ADlI'
    ),
    (
      $$network-fundamentals$$,
      $$Basic Device Security$$,
      $$basic-device-security$$,
      $$Practice the simple router and switch security steps that appear often in CCNA labs.$$,
      $$## Simple Explanation

Basic device security means protecting routers and switches from unauthorized access. Even a few simple settings make a big difference. In CCNA, you should know how to secure privileged access, hide passwords in the configuration, and save your changes.

## Key Concepts

- A hostname identifies the device.
- enable password protects privileged access, but it is weaker.
- enable secret is preferred because it is stored more securely.
- service password-encryption hides plain-text passwords in the config output.
- copy running-config startup-config saves the current configuration.

## Important Points for the CCNA Exam

- enable secret is preferred over enable password.
- Password protection should be part of the basic setup.
- running-config is the active configuration in memory.
- startup-config is the saved configuration used after a reboot.
- Unsaved changes can be lost when the device restarts.

## Real World Example

An administrator configures a branch switch, sets a hostname, adds an enable secret, enables password encryption, and saves the configuration so those settings are still there after a restart.

## Quick Review

- Secure device access starts with basic settings.
- enable secret is more secure than enable password.
- Save the configuration if you want it to survive a reboot.

## Key Terms

- Hostname
- enable password
- enable secret
- service password-encryption
- running-config
- startup-config

## Mini Practice Questions

1. Which command is preferred for securing privileged EXEC access?
2. Which command saves the active configuration so it remains after reboot?$$,
      6,
      11,
      'https://www.youtube.com/watch?v=SDocmq1c05s'
    ),
    (
      $$network-fundamentals$$,
      $$OSI Model Basics$$,
      $$osi-model-basics$$,
      $$Use the seven-layer OSI model to organize protocols and troubleshoot network problems.$$,
      $$## Simple Explanation

The OSI model is a seven-layer reference model used to understand how networking works. It is mainly a conceptual tool, which means it helps you organize protocols and troubleshoot issues in a structured way. It is very important for CCNA study even though real networks do not use the OSI model as a strict implementation guide.

## Key Concepts

- The OSI model has seven layers.
- Layer 1 is Physical.
- Layer 2 is Data Link.
- Layer 3 is Network.
- Layer 4 is Transport.
- Layer 5 is Session.
- Layer 6 is Presentation.
- Layer 7 is Application.
- Different protocols can be associated with different layers.

## Important Points for the CCNA Exam

- You should know the OSI layers in order from 1 to 7 and 7 to 1.
- STP is a Layer 2 protocol.
- OSPF is a Layer 3 protocol.
- DHCP is often discussed at Layer 7 in CCNA-level explanations.
- The OSI model is useful for troubleshooting by narrowing down where a problem exists.

## Real World Example

If two devices cannot communicate, you can use the OSI model to work through the problem. You might first check cabling at Layer 1, switching behavior at Layer 2, and addressing or routing at Layer 3.

## Quick Review

- The OSI model has seven layers.
- It is mainly a conceptual and troubleshooting model.
- Protocols are often described by the layer where they operate.

## Key Terms

- OSI model
- Physical
- Data Link
- Network
- Transport
- Session
- Presentation
- Application

## Mini Practice Questions

1. Which OSI layer is responsible for routing?
2. Which of these is a Layer 2 protocol: STP, OSPF, or DHCP?$$,
      7,
      13,
      'https://www.youtube.com/watch?v=7nmYoL0t2tU'
    ),
    (
      $$network-fundamentals$$,
      $$Introduction to the Cisco CLI$$,
      $$introduction-to-the-cisco-cli$$,
      $$Get comfortable with CLI modes, prompts, and saving configuration on Cisco devices.$$,
      $$## Simple Explanation

The CLI, or command-line interface, is the main way you configure Cisco routers and switches. Instead of using menus, you type commands. For the CCNA, you need to know the main CLI modes, the prompts for each mode, and how to save your configuration.

## Key Concepts

- User EXEC mode is the starting mode and has limited commands.
- Privileged EXEC mode gives access to more commands.
- Global Configuration mode is where you change the device configuration.
- enable moves from User EXEC mode to Privileged EXEC mode.
- configure terminal moves into Global Configuration mode.
- running-config is the active configuration.
- startup-config is the saved configuration.

## Important Points for the CCNA Exam

- Know these prompts:
- Router> means User EXEC mode.
- Router# means Privileged EXEC mode.
- Router(config)# means Global Configuration mode.
- Unsaved changes in running-config can be lost after a reboot.
- Saving the configuration is a core CLI skill.

## Real World Example

A technician connects to a switch, enters privileged mode with enable, enters global configuration mode with configure terminal, changes the hostname, and then saves the running configuration so the change remains after reboot.

## Quick Review

- The CLI is the main Cisco configuration interface.
- Different modes allow different levels of access.
- running-config is active now.
- startup-config is the saved version used after reboot.

## Key Terms

- CLI
- User EXEC mode
- Privileged EXEC mode
- Global Configuration mode
- running-config
- startup-config

## Mini Practice Questions

1. Which command moves you from User EXEC mode to Privileged EXEC mode?
2. What is the difference between running-config and startup-config?$$,
      8,
      12,
      'https://www.youtube.com/watch?v=IYbtai7Nu2g'
    )
) as l(module_slug, title, slug, summary, content, order_index, estimated_minutes, video_url)
  on l.module_slug = m.slug
where m.course_id = (
  select id
  from public.courses
  where slug = 'ccna-200-301-preparation'
)
on conflict (module_id, slug) do update
set
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  order_index = excluded.order_index,
  estimated_minutes = excluded.estimated_minutes,
  video_url = excluded.video_url;
