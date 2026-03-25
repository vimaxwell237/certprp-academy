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
and (
  slug in (
    'network-devices-and-their-roles',
    'lan-architectures',
    'interfaces-and-cables',
    'switch-interfaces-and-common-interface-problems',
    'private-ipv4-addressing',
    'ipv6-addressing-fundamentals',
    'ipv6-neighbor-discovery-and-address-types',
    'ipv6-anycast-multicast-and-modified-eui-64',
    'ipv6-neighbor-discovery-and-slaac',
    'configuring-and-verifying-ipv6-addresses',
    'verifying-ip-parameters-on-client-operating-systems',
    'wireless-fundamentals',
    'wifi-channels-and-ssid-basics',
    'wireless-security',
    'virtualization-and-cloud-fundamentals',
    'containers-fundamentals',
    'vrf-fundamentals',
    'ethernet-lan-switching-fundamentals',
    'ethernet-switching-forwarding-and-flooding',
    'analyzing-ethernet-switching-arp-and-ping'
  )
  or order_index in (1, 9, 11, 13, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36)
);

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
      $$Understand the main job of routers, switches, endpoints, servers, firewalls, IPS tools, and PoE-supported devices in a simple network.$$,
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

### 1.1.b Layer 2 and Layer 3 switches

- A Layer 2 switch forwards traffic based on MAC addresses.
- A Layer 3 switch can do Layer 2 switching and Layer 3 routing.
- Layer 3 switches are often used for inter-VLAN routing inside a campus network.
- Layer 2 switching keeps traffic inside the same broadcast domain unless a router or Layer 3 switch is used.

### 1.1.c IPS

- IPS stands for Intrusion Prevention System.
- An IPS inspects traffic for malicious patterns or suspicious behavior.
- An IPS can automatically block harmful traffic.
- Some next-generation firewalls include IPS features in the same platform.

### 1.1.h PoE

- PoE stands for Power over Ethernet.
- PoE lets an Ethernet cable carry both data and electrical power.
- PoE is commonly used for access points, IP phones, and cameras.
- PoE reduces the need for separate power adapters near the device.

## Important Points for the CCNA Exam

- Switches are mainly used for communication inside the same local network.
- Routers are used when traffic must move between different networks.
- Know the difference between Layer 2 switching and Layer 3 switching.
- Know that IPS tools are designed to detect and prevent malicious traffic.
- Remember that PoE supplies power to devices across the Ethernet cable.
- Firewalls are security devices, not just forwarding devices.

## Real World Example

In a branch office, employee laptops connect to a switch. The switch connects to a router, and the router connects the office to the internet. A next-generation firewall with IPS features can sit at the edge to filter and block attacks. The office access points may receive both data and power through PoE-enabled switch ports.

## Quick Review

- Endpoints create and receive data.
- Switches move traffic inside a LAN.
- Routers move traffic between networks.
- Layer 3 switches can also route between VLANs.
- IPS helps stop malicious traffic.
- PoE powers devices through Ethernet.

## Key Terms

- Network
- Node
- End host
- Endpoint
- Client
- Server
- Switch
- Layer 2 switch
- Layer 3 switch
- Router
- Firewall
- Next-generation firewall
- IPS
- PoE

## Mini Practice Questions

1. What is the main difference between a Layer 2 switch and a Layer 3 switch?
2. What is the purpose of an IPS?
3. What does PoE allow an Ethernet cable to deliver besides data?$$,
      1,
      15,
      'https://www.youtube.com/watch?v=H8W9oMNSuwo'
    ),
    (
      $$network-fundamentals$$,
      $$LAN Architectures$$,
      $$lan-architectures$$,
      $$Learn how campus, data center, SOHO, on-premises, and cloud designs are organized and why each architecture is used.$$,
      $$## Simple Explanation

LAN architectures describe how devices and switches are arranged inside a local network. Small networks often use one simple device, while larger campus and data center networks use structured designs to improve performance, growth, and reliability.

## Key Concepts

- A LAN connects devices in a limited area such as an office, school, or building.
- A two-tier architecture has an Access layer and a Distribution layer.
- The Access layer connects end devices.
- The Distribution layer collects traffic from access switches and connects toward other networks.
- A three-tier architecture adds a Core layer above the Distribution layer.
- The Core layer focuses on fast forwarding across the network.
- The Core layer should avoid CPU intensive tasks when possible.
- Spine-leaf architecture is mainly used in data centers.
- In spine-leaf, every leaf switch connects to every spine switch.
- Leaf switches do not connect directly to other leaf switches.
- Spine switches do not connect directly to other spine switches.
- Servers usually connect to leaf switches.
- SOHO means Small Office or Home Office.
- A SOHO router often combines routing, switching, firewall, and wireless functions.
- Star topology uses a central device.
- Full mesh means every device connects to every other device.
- Partial mesh means only some devices have multiple paths.
- North-South traffic moves into or out of the network.
- East-West traffic moves inside the network, often between internal devices.

### 1.2.f On-premises and cloud

- On-premises resources are located in equipment owned and managed by the organization.
- Cloud resources are hosted by a provider and reached across a network connection.
- Many businesses use both on-premises and cloud services at the same time.
- Choosing between on-premises and cloud depends on cost, control, scalability, and business needs.

## Important Points for the CCNA Exam

- Know the difference between two-tier and three-tier campus design.
- Know that the Core layer is focused on fast transport.
- Know the basic spine-leaf connection rules.
- Understand what a SOHO network usually looks like.
- Be able to identify star, full mesh, and partial mesh topologies.
- Know the meaning of North-South and East-West traffic.
- Know the basic difference between on-premises and cloud-hosted resources.

## Real World Example

A university campus may use a three-tier design. Student devices connect at the Access layer, building switches connect into the Distribution layer, and the Core layer moves traffic quickly between buildings and shared services. The university may keep identity systems on-premises but host email or learning apps in the cloud.

## Quick Review

- LAN architectures describe how local networks are built.
- Two-tier and three-tier designs are common in campus networks.
- Spine-leaf is mainly used in data centers.
- SOHO networks are small and usually use one multifunction device.
- On-premises systems are local, while cloud systems are provider-hosted.

## Key Terms

- LAN
- Access layer
- Distribution layer
- Core layer
- Spine-leaf
- SOHO
- Star topology
- Full mesh
- Partial mesh
- North-South traffic
- East-West traffic
- On-premises
- Cloud

## Mini Practice Questions

1. Which layer in a three-tier campus design is focused on fast forwarding?
2. In a spine-leaf design, does a leaf switch connect directly to another leaf switch?
3. What is the basic difference between on-premises and cloud resources?$$,
      9,
      14,
      'https://www.youtube.com/watch?v=PvyEcLhmNBk'
    ),
    (
      $$network-fundamentals$$,
      $$Interfaces and Cables$$,
      $$interfaces-and-cables$$,
      $$Compare copper, fiber, shared media, and point-to-point cabling concepts used in Ethernet networks.$$,
      $$## Simple Explanation

Devices need physical interfaces and cables to communicate over a wired network. For the CCNA exam, you should know the basic cable categories, when copper or fiber is used, and how modern Ethernet links differ from older shared-media networks.

## Key Concepts

- Ethernet standards define how wired devices communicate.
- UTP means Unshielded Twisted Pair.
- A UTP cable has 8 wires grouped into 4 twisted pairs.
- Copper Ethernet commonly uses an RJ45 connector.
- A straight-through cable is usually used between different device types.
- A crossover cable is usually used between similar device types.
- Auto MDI-X allows devices to adjust cable pair usage automatically.
- Fiber optic cabling uses light instead of electrical signals.
- Multimode fiber is usually cheaper and used for shorter distances.
- Single-mode fiber is usually more expensive and used for longer distances.
- SFP modules allow routers and switches to use fiber links.

### 1.3.d Ethernet shared media

- Shared media means multiple devices use the same communication path.
- Older Ethernet hub networks were shared-media networks.
- Shared media can lead to collisions because devices compete to send.
- Modern switched Ethernet reduces shared-media problems by giving devices dedicated switch ports.

### 1.3.e Point-to-point connections

- A point-to-point connection is a direct link between exactly two devices.
- Many modern Ethernet links are point-to-point links.
- Point-to-point links are also common in WAN environments.
- Point-to-point connections are easier to troubleshoot because only two endpoints use the link.

## Important Points for the CCNA Exam

- Know the difference between straight-through and crossover cables.
- Know that Auto MDI-X reduces the need to worry about manual cable selection.
- Know that copper Ethernet commonly uses RJ45.
- Know the difference between multimode and single-mode fiber.
- Know that shared media is associated with older Ethernet designs and collisions.
- Know that point-to-point means a direct link between only two devices.
- Know the purpose of an SFP module.

## Real World Example

A desktop PC connected to an office switch usually uses a copper Ethernet cable with RJ45 connectors. A long building-to-building link may use fiber and SFP modules because fiber handles distance better than copper. In contrast, an old hub-based network used shared media, while a modern switch-to-switch uplink is usually point-to-point.

## Quick Review

- Copper and fiber are the main cable categories.
- Straight-through is usually used for different device types.
- Crossover is usually used for similar device types.
- Shared media means multiple devices use the same path.
- Point-to-point means one direct link between two devices.
- Fiber is better for longer distance links.

## Key Terms

- Ethernet
- UTP
- RJ45
- Straight-through cable
- Crossover cable
- Auto MDI-X
- Fiber optic cable
- Multimode fiber
- Single-mode fiber
- SFP
- Shared media
- Point-to-point

## Mini Practice Questions

1. Which connector is commonly used with copper Ethernet cabling?
2. Which type of fiber is usually better for longer distances?
3. What is the difference between shared media and a point-to-point connection?$$,
      11,
      13,
      'https://www.youtube.com/watch?v=fi4MdM8Brp8'
    ),
    (
      $$network-fundamentals$$,
      $$Switch Interfaces and Common Interface Problems$$,
      $$switch-interfaces-and-common-interface-problems$$,
      $$Understand speed, duplex, collisions, and interface counters so you can identify common link problems quickly.$$,
      $$## Simple Explanation

Switch interfaces are the ports where network cables connect to a switch. These interfaces matter at both Layer 1 and Layer 2. Problems with speed, duplex, or negotiation can lead to poor performance and interface errors.

## Key Concepts

- Switch interfaces operate at Layer 1 and Layer 2.
- Interfaces can run at speeds such as 10 Mbps, 100 Mbps, and 1 Gbps.
- Half duplex means a device cannot send and receive at the same time.
- Full duplex means a device can send and receive at the same time.
- Autonegotiation allows devices to choose the best speed and duplex automatically.
- A duplex mismatch happens when each side uses a different duplex setting.
- Common interface issues include CRC errors, runts, giants, input errors, and output errors.
- show interfaces status gives a fast summary of switch ports.

### 1.4 Collisions

- A collision happens when two devices send at the same time on shared media.
- Collisions were common on older half-duplex Ethernet networks that used hubs.
- Full-duplex switched Ethernet normally avoids collisions.

### 1.4 Speed mismatch

- A speed mismatch happens when the two sides of a link do not operate at the same speed.
- A speed mismatch can prevent the link from coming up or can cause unstable performance.
- Speed settings and autonegotiation should be checked during troubleshooting.

## Important Points for the CCNA Exam

- Know the meaning of speed and duplex.
- Know why full duplex is preferred on modern Ethernet links.
- Understand what autonegotiation does.
- Know that a duplex mismatch can cause performance and error problems.
- Associate collisions with older half-duplex shared Ethernet.
- Know that speed mismatches can also cause link problems.
- Recognize common interface error terms such as CRC, runts, and giants.
- Know when to use show interfaces status.

## Real World Example

A user reports a slow connection even though the link light is on. The switch shows interface errors because one side of the link is using half duplex while the other side is using full duplex. In another case, the link may fail because one side is manually set to a different speed than the other.

## Quick Review

- Switch ports work at Layer 1 and Layer 2.
- Speed and duplex settings affect performance.
- Autonegotiation helps devices choose settings.
- Collisions are linked to half-duplex shared media.
- Duplex and speed mismatches can create errors and slowness.

## Key Terms

- Interface
- Speed
- Duplex
- Half duplex
- Full duplex
- Autonegotiation
- Duplex mismatch
- Speed mismatch
- Collision
- CRC errors
- Runts
- Giants

## Mini Practice Questions

1. What is a collision?
2. What problem occurs when two sides of a link use different duplex settings?
3. What happens when the two sides of a link do not use the same speed?$$,
      13,
      13,
      'https://www.youtube.com/watch?v=cCqluocfQe0'
    ),
    (
      $$network-fundamentals$$,
      $$Private IPv4 Addressing$$,
      $$private-ipv4-addressing$$,
      $$Learn the RFC 1918 private IPv4 ranges and why NAT is usually needed when private networks communicate with the internet.$$,
      $$## Simple Explanation

Private IPv4 addresses are used inside internal networks like homes, schools, and offices. They are not meant to be routed across the public internet. This lets many organizations reuse the same internal address ranges safely, while a router usually uses NAT to let those private devices reach the internet.

## Key Concepts

- Private IPv4 addresses are used inside internal networks.
- Private IPv4 addresses are defined by RFC 1918.
- The three private IPv4 ranges are 10.0.0.0/8, 172.16.0.0/12, and 192.168.0.0/16.
- Private addresses are not publicly routable on the internet.
- Many different organizations can reuse the same private ranges.
- NAT is commonly used when private hosts need internet access.

## Important Points for the CCNA Exam

- Memorize the three RFC 1918 private IPv4 ranges.
- Know that private IPv4 addresses are not routed on the public internet.
- Understand that NAT commonly connects private networks to the internet.
- Be able to quickly identify whether an IPv4 address is private or public.

## Real World Example

A company may assign 192.168.10.0/24 to office PCs and printers. Those devices communicate internally with private addresses, but when users browse the internet, the company router translates those private addresses to a public IP address.

## Quick Review

- Private IPv4 addressing is for internal networks.
- RFC 1918 defines the private ranges.
- Private addresses are not routed on the public internet.
- NAT commonly connects private networks to the internet.

## Key Terms

- Private IPv4
- RFC 1918
- NAT
- Public IPv4
- Internal network
- Address conservation

## Mini Practice Questions

1. Which three IPv4 ranges are reserved for private addressing?
2. Can a private IPv4 address be routed directly across the public internet?
3. What technology is commonly used to let private IPv4 hosts access the internet?$$,
      21,
      11,
      'https://youtu.be/3ROdsfEUuhs'
    ),
    (
      $$network-fundamentals$$,
      $$IPv6 Fundamentals and Format$$,
      $$ipv6-addressing-fundamentals$$,
      $$Build a strong beginner foundation for IPv6 by learning why it exists, how it is written, and how to read its hexadecimal format.$$,
      $$## Simple Explanation

IPv6 was created because the internet needed far more addresses than IPv4 could provide. An IPv6 address is much longer than an IPv4 address, but once you understand the pattern, it becomes easier to read. For the CCNA exam, you should know that IPv6 addresses are 128 bits long, written in hexadecimal, and separated into groups with colons.

## Key Concepts

- IPv6 was designed to help solve IPv4 address exhaustion.
- An IPv6 address is 128 bits long.
- IPv6 addresses are written in hexadecimal.
- Hexadecimal uses the numbers 0 through 9 and the letters A through F.
- IPv6 addresses are written as eight groups of four hexadecimal characters.
- The groups are separated by colons.
- Example: 2001:0db8:0000:0000:0000:ff00:0042:8329

## Important Points for the CCNA Exam

- Remember that IPv6 uses 128-bit addresses, not 32-bit addresses like IPv4.
- Be able to recognize hexadecimal notation in an IPv6 address.
- Know that IPv6 addresses are normally shown as eight groups separated by colons.
- Do not confuse the longer IPv6 format with subnet masks written in dotted decimal.

## Real World Example

An internet provider may give a business an IPv6 prefix so every department, device, and service can have its own globally unique address range without running out of space as quickly as with IPv4.

## Quick Review

- IPv6 was created because IPv4 does not have enough addresses for long-term growth.
- IPv6 addresses are 128 bits long.
- IPv6 uses hexadecimal instead of dotted decimal.
- An IPv6 address is written as eight groups separated by colons.

## Key Terms

- IPv6
- IPv4 exhaustion
- 128-bit address
- Hexadecimal
- Hextet
- Colon-separated notation

## Mini Practice Questions

1. How many bits are in an IPv6 address?
2. Which numbering system does IPv6 use?
3. How are the groups in an IPv6 address separated?$$,
      22,
      11,
      'https://youtu.be/ZNuXyOXae5U'
    ),
    (
      $$network-fundamentals$$,
      $$IPv6 Compression and Address Types$$,
      $$ipv6-neighbor-discovery-and-address-types$$,
      $$Learn the IPv6 shortening rules and the major unicast address types you must recognize quickly for the CCNA exam.$$,
      $$## Simple Explanation

IPv6 addresses are long, so there are rules that make them easier to write. You can remove leading zeros in a group, and you can replace one continuous stretch of all-zero groups with double colons. You also need to know the main IPv6 unicast address types because the CCNA exam often asks what an address is used for based on its prefix.

## Key Concepts

- Leading zeros in a group can be removed.
- Example: 0db8 becomes db8.
- One continuous sequence of zero groups can be replaced with ::.
- The double-colon shortcut can be used only once in one written address.
- 1.9.a Global Unicast addresses are public IPv6 addresses.
- Global Unicast uses the 2000::/3 range.
- 1.9.a Unique Local addresses are private-style internal addresses.
- Unique Local uses the FD00::/7 range.
- 1.9.a Link Local addresses are used on the local segment only.
- Link Local uses the FE80::/10 range.

## Important Points for the CCNA Exam

- Be able to shorten an IPv6 address correctly.
- Remember that only one zero sequence can be replaced with :: in a written address.
- Be able to match 2000::/3, FD00::/7, and FE80::/10 to the correct address types.
- Know that Link Local addresses are not routed across the wider network.

## Real World Example

If a router interface has a Global Unicast address for normal routed traffic, it will still also use a Link Local address so it can talk to nearby devices like the next-hop router on the same link.

## Quick Review

- IPv6 shortening removes extra zeros.
- The :: shortcut is allowed only once per address.
- Global Unicast is used for public routing.
- Unique Local is used for internal addressing.
- Link Local is used only on the local network segment.

## Key Terms

- Address compression
- Leading zeros
- Double colon
- Global Unicast
- Unique Local
- Link Local
- Prefix

## Mini Practice Questions

1. What is the main rule about using :: in an IPv6 address?
2. Which IPv6 prefix identifies Link Local addresses?
3. Which IPv6 address type is most similar to private IPv4 addressing?$$,
      23,
      12,
      'https://youtu.be/BrTMMOXFhDU'
    ),
    (
      $$network-fundamentals$$,
      $$IPv6 Anycast, Multicast, and Modified EUI-64$$,
      $$ipv6-anycast-multicast-and-modified-eui-64$$,
      $$Cover the missing IPv6 blueprint items by learning how anycast, multicast, and Modified EUI-64 work in simple exam-focused terms.$$,
      $$## Simple Explanation

IPv6 uses more than just normal unicast communication. Anycast allows the same address to exist on multiple devices so traffic reaches the nearest one. Multicast lets one sender communicate with a group of receivers. Modified EUI-64 is a method a device can use to build part of its IPv6 address automatically from its MAC address.

## Key Concepts

- 1.9.b Anycast uses the same IPv6 address on multiple devices.
- Anycast traffic is delivered to the nearest matching destination based on routing.
- 1.9.c Multicast means one sender communicates with multiple receivers.
- IPv6 uses multicast instead of broadcast for many control functions.
- Multicast addresses use the FF00::/8 range.
- 1.9.d Modified EUI-64 creates a 64-bit interface ID from a MAC address.
- Modified EUI-64 inserts FFFE into the middle of the MAC-based value.
- Modified EUI-64 also changes the seventh bit of the original MAC-derived value.

## Important Points for the CCNA Exam

- Know that anycast reaches the nearest device using a shared address.
- Know that IPv6 uses multicast and does not rely on broadcast like IPv4.
- Recognize FF00::/8 as the IPv6 multicast range.
- Understand the basic idea of Modified EUI-64 even if the exam does not ask for a full manual calculation.

## Real World Example

A company might place the same anycast address on several DNS servers so users automatically reach the closest one. At the same time, routers and hosts still use IPv6 multicast for local network operations such as neighbor discovery.

## Quick Review

- Anycast means one address on multiple devices.
- Multicast means one sender to many receivers.
- IPv6 uses multicast instead of broadcast.
- Modified EUI-64 can automatically build an interface ID from a MAC address.

## Key Terms

- Anycast
- Multicast
- FF00::/8
- Interface ID
- Modified EUI-64
- MAC address

## Mini Practice Questions

1. What is the main purpose of an IPv6 anycast address?
2. Which IPv6 address range is used for multicast?
3. What does Modified EUI-64 help a device create?$$,
      24,
      11,
      'https://youtu.be/rwkHfsWQwy8'
    ),
    (
      $$network-fundamentals$$,
      $$IPv6 Neighbor Discovery and SLAAC$$,
      $$ipv6-neighbor-discovery-and-slaac$$,
      $$Understand how IPv6 devices discover neighbors, learn about routers, and build addresses automatically with SLAAC.$$,
      $$## Simple Explanation

IPv6 does not use ARP like IPv4. Instead, it uses Neighbor Discovery Protocol, or NDP, which works with ICMPv6 messages. NDP helps devices discover nearby neighbors and routers, and it also supports automatic addressing through SLAAC.

## Key Concepts

- NDP stands for Neighbor Discovery Protocol.
- NDP replaces ARP in IPv6 networks.
- NDP uses ICMPv6 messages.
- Neighbor Solicitation is used to ask for neighbor information.
- Neighbor Advertisement is used to answer with neighbor information.
- Routers send Router Advertisements on the local link.
- SLAAC stands for Stateless Address Auto Configuration.
- SLAAC lets a host build its own IPv6 address from router-provided information.

## Important Points for the CCNA Exam

- Know that IPv6 uses NDP instead of ARP.
- Know that Neighbor Solicitation and Neighbor Advertisement are key ICMPv6 messages.
- Understand the basic idea of Router Advertisements.
- Remember that SLAAC allows automatic IPv6 addressing without manual configuration on the host.

## Real World Example

When a laptop joins an IPv6-enabled office network, it can listen for a Router Advertisement, learn the network prefix, build its own IPv6 address, and then use NDP to find other nearby devices.

## Quick Review

- NDP replaces ARP in IPv6.
- ICMPv6 carries NDP messages.
- Neighbor Solicitation asks for information.
- Neighbor Advertisement replies with information.
- SLAAC helps hosts create IPv6 addresses automatically.

## Key Terms

- NDP
- ICMPv6
- Neighbor Solicitation
- Neighbor Advertisement
- Router Advertisement
- SLAAC
- Stateless Address Auto Configuration

## Mini Practice Questions

1. Which IPv6 protocol replaces ARP?
2. Which message is used to answer a Neighbor Solicitation?
3. What does SLAAC let a host do automatically?$$,
      25,
      11,
      'https://youtu.be/rwkHfsWQwy8'
    ),
    (
      $$network-fundamentals$$,
      $$Configuring and Verifying IPv6 Addressing$$,
      $$configuring-and-verifying-ipv6-addresses$$,
      $$Practice the IOS commands and verification steps needed to configure IPv6 on router interfaces and confirm that it works.$$,
      $$## Simple Explanation

Routers need IPv6 addresses on their interfaces before they can send traffic between IPv6 networks. In Cisco IOS, IPv6 routing must also be turned on globally. After configuration, you should always verify the interface address, interface state, and connectivity.

## Key Concepts

- IPv6 routing is enabled with ipv6 unicast-routing.
- An interface can be configured with the ipv6 address command.
- An IPv6 interface can have both a Global Unicast address and a Link Local address.
- no shutdown may still be needed to bring a router interface up.
- show ipv6 interface brief is a useful verification command.
- ping can be used to verify IPv6 connectivity.

## Important Points for the CCNA Exam

- Memorize ipv6 unicast-routing as the command that enables IPv6 routing on a router.
- Be comfortable assigning an IPv6 address and prefix length to an interface.
- Remember that IPv6 interfaces often have more than one address type.
- Expect basic IPv6 configuration and verification tasks in labs and exam questions.

## Real World Example

An administrator enables ipv6 unicast-routing, configures 2001:db8:1:1::1/64 on a router interface, enables the interface, and checks show ipv6 interface brief before testing with ping to another IPv6 device.

## Quick Review

- Enable IPv6 routing first.
- Configure the IPv6 address on the correct interface.
- Bring the interface up if needed.
- Verify the address and interface status.
- Test connectivity after configuration.

## Key Terms

- ipv6 unicast-routing
- ipv6 address
- Global Unicast
- Link Local
- show ipv6 interface brief
- Prefix length

## Mini Practice Questions

1. Which command enables IPv6 routing on a Cisco router?
2. Which command is commonly used to verify IPv6 interface addressing quickly?
3. Can one IPv6 interface have both a Link Local and a Global Unicast address?$$,
      26,
      12,
      'https://youtu.be/WSBEVFANMmc'
    ),
    (
      $$network-fundamentals$$,
      $$Verifying IP Parameters on Client Operating Systems$$,
      $$verifying-ip-parameters-on-client-operating-systems$$,
      $$Check the most important client IP settings on Windows, macOS, and Linux so you can troubleshoot connectivity problems quickly.$$,
      $$## Simple Explanation

When a client cannot reach the network, the first step is to check its IP settings. A wrong IP address, subnet mask, default gateway, or DNS server can stop communication even if the cabling and switch port are fine. Different operating systems use different commands, but you are always checking the same basic information.

## Key Concepts

- Important parameters include the IP address, subnet mask, default gateway, and DNS server.
- Windows commonly uses ipconfig and ipconfig /all.
- macOS commonly uses ifconfig and networksetup.
- Linux commonly uses ip addr and ifconfig.
- ping tests whether another device can be reached.
- traceroute helps show where traffic stops along the path.

## Important Points for the CCNA Exam

- Know which commands are commonly associated with Windows, macOS, and Linux.
- Always check the local IP settings before assuming the network itself is broken.
- Remember that ping tests reachability.
- Remember that traceroute helps you find where a path problem is happening.

## Real World Example

A student can reach the local printer but cannot open websites. After checking ipconfig /all, the technician sees the PC has the correct IP address but the wrong default gateway. Once the gateway is corrected, access to remote networks returns.

## Quick Review

- Verify the local IP settings first.
- Check the IP address, mask, gateway, and DNS server.
- Use the right command for the operating system.
- Use ping for reachability tests.
- Use traceroute to see where traffic fails.

## Key Terms

- IP address
- Subnet mask
- Default gateway
- DNS server
- ipconfig
- ifconfig
- networksetup
- ip addr
- ping
- traceroute

## Mini Practice Questions

1. Which Windows command shows detailed IP settings?
2. Which Linux command is commonly used to view interface addressing?
3. What is traceroute mainly used for?$$,
      27,
      10,
      'https://www.youtube.com/@JeremysITLab/videos'
    ),
    (
      $$network-fundamentals$$,
      $$Wireless Fundamentals$$,
      $$wireless-fundamentals$$,
      $$Learn the core Wi-Fi standards, service set terms, RF behavior, and controller concepts that matter most for the CCNA exam.$$,
      $$## Simple Explanation

Wireless networking lets devices communicate without a cable by using radio waves. For CCNA, you should know the major Wi-Fi standards, understand how radio behavior affects the signal, and recognize how access points and wireless controllers fit into a wireless LAN design.

## Key Concepts

- Wireless LANs use IEEE 802.11 standards.
- Wi-Fi 4 maps to 802.11n.
- Wi-Fi 5 maps to 802.11ac.
- Wi-Fi 6 maps to 802.11ax.
- Absorption weakens a wireless signal when material takes in the energy.
- Reflection happens when a signal bounces off a surface.
- Refraction happens when a signal changes direction as it passes through different material.
- Interference from other devices or networks can reduce wireless performance.
- BSS stands for Basic Service Set.
- ESS stands for Extended Service Set.
- A Wireless LAN Controller centrally manages access points.

## Important Points for the CCNA Exam

- Be able to match Wi-Fi generations to their 802.11 names.
- Know the basic meaning of absorption, reflection, refraction, and interference.
- Understand that a BSS is one access point and its clients.
- Understand that an ESS is multiple access points joined into one larger wireless network.
- Know the basic role of a WLC in enterprise wireless networks.

## Real World Example

In a school building, several access points may use the same network name so students can move from room to room without losing connectivity. Together, those APs form an ESS, while the controller helps manage them from one place.

## Quick Review

- Wi-Fi uses 802.11 standards.
- RF behavior affects wireless coverage and quality.
- BSS and ESS describe wireless service-set design.
- A WLC makes enterprise AP management easier.

## Key Terms

- 802.11
- Wi-Fi 4
- Wi-Fi 5
- Wi-Fi 6
- Absorption
- Reflection
- Refraction
- Interference
- BSS
- ESS
- WLC

## Mini Practice Questions

1. Which 802.11 standard is called Wi-Fi 6?
2. What is the difference between a BSS and an ESS?
3. What is the main job of a Wireless LAN Controller?$$,
      28,
      12,
      'https://youtu.be/zuYiktLqNYQ'
    ),
    (
      $$network-fundamentals$$,
      $$Wi-Fi Channels and SSID Basics$$,
      $$wifi-channels-and-ssid-basics$$,
      $$Add the missing wireless blueprint coverage by learning non-overlapping channels and the purpose of the SSID.$$,
      $$## Simple Explanation

Wireless networks work better when nearby access points use channels that do not interfere with each other. In the 2.4 GHz band, the most common non-overlapping channels are 1, 6, and 11. You also need to know what an SSID is, because it is the wireless network name clients see when choosing which network to join.

## Key Concepts

- 1.11.a Non-overlapping Wi-Fi channels help reduce interference between nearby APs.
- In 2.4 GHz Wi-Fi, channels 1, 6, and 11 are the common non-overlapping choices.
- Overlapping channels can cause interference and poor performance.
- 1.11.b SSID stands for Service Set Identifier.
- The SSID is the wireless network name shown to users.
- Multiple APs in the same WLAN often use the same SSID to support roaming.

## Important Points for the CCNA Exam

- Memorize channels 1, 6, and 11 for 2.4 GHz non-overlapping coverage.
- Know that overlapping channels increase interference.
- Know that SSID is simply the wireless network name.
- Understand that multiple access points can share one SSID in an enterprise WLAN.

## Real World Example

In an office with three nearby access points, an administrator may assign channels 1, 6, and 11 so the APs interfere less with each other. All three APs can still use the same SSID, such as CertPrep-Staff, so users move around the office without manually changing networks.

## Quick Review

- Non-overlapping channels reduce wireless interference.
- In 2.4 GHz Wi-Fi, the common non-overlapping channels are 1, 6, and 11.
- An SSID is the wireless network name.
- Multiple APs can share the same SSID.

## Key Terms

- Non-overlapping channel
- 2.4 GHz
- Channel 1
- Channel 6
- Channel 11
- SSID
- Service Set Identifier
- Roaming

## Mini Practice Questions

1. Which three channels are commonly used as non-overlapping channels in 2.4 GHz Wi-Fi?
2. What does SSID stand for?
3. Why do administrators avoid overlapping channels on nearby access points?$$,
      29,
      10,
      'https://youtu.be/zuYiktLqNYQ'
    ),
    (
      $$network-fundamentals$$,
      $$Wireless Security$$,
      $$wireless-security$$,
      $$Understand the evolution of Wi-Fi security and the authentication and encryption terms most likely to appear on the CCNA exam.$$,
      $$## Simple Explanation

Wireless traffic moves through the air, so security is very important. Older wireless security methods are weak and should not be trusted, while newer methods provide much better protection. On the CCNA exam, you should know the order of the major security standards and the role of common authentication and encryption methods.

## Key Concepts

- WEP is old, weak, and obsolete.
- WPA improved security but was only an intermediate step.
- WPA2 became the long-time standard in many networks.
- WPA3 is the newest and strongest option among the common CCNA terms.
- Enterprise wireless networks often use 802.1X for authentication.
- EAP is commonly used with 802.1X.
- AES is a strong encryption method.
- CCMP is an encryption mode associated with WPA2 and modern wireless security.

## Important Points for the CCNA Exam

- Know the security progression: WEP, WPA, WPA2, WPA3.
- Remember that WEP is not considered secure.
- Know that enterprise authentication commonly uses 802.1X with EAP.
- Associate AES and CCMP with stronger wireless protection.

## Real World Example

A company may require employees to log in to the wireless network with their own username and password through 802.1X authentication, rather than sharing one simple passphrase with everyone in the office.

## Quick Review

- WEP is weak and outdated.
- WPA was an improvement, but WPA2 and WPA3 are stronger.
- Enterprise wireless often uses 802.1X and EAP.
- AES and CCMP are important security terms for the exam.

## Key Terms

- WEP
- WPA
- WPA2
- WPA3
- 802.1X
- EAP
- AES
- CCMP

## Mini Practice Questions

1. Which wireless security standard is considered obsolete and weak?
2. Which authentication framework is commonly used in enterprise Wi-Fi?
3. Which is generally stronger for modern wireless security: WEP or WPA3?$$,
      30,
      10,
      'https://youtu.be/wHXKo9So5y8'
    ),
    (
      $$network-fundamentals$$,
      $$Virtualization and Cloud Fundamentals$$,
      $$virtualization-and-cloud-fundamentals$$,
      $$Learn how virtualization works, how hypervisors are classified, and how the main cloud service and deployment models fit together.$$,
      $$## Simple Explanation

Virtualization lets one physical computer run multiple virtual machines. This helps companies use hardware more efficiently and makes it easier to deploy servers quickly. Cloud computing builds on these ideas by delivering computing resources as services instead of requiring every company to buy and manage all hardware itself.

## Key Concepts

- Virtualization allows multiple virtual machines to run on one physical server.
- A virtual machine has its own operating system and resources.
- A Type 1 hypervisor runs directly on the hardware.
- A Type 2 hypervisor runs on top of an existing operating system.
- Cloud computing follows service and deployment models.
- IaaS means Infrastructure as a Service.
- PaaS means Platform as a Service.
- SaaS means Software as a Service.
- Public cloud is shared provider infrastructure.
- Private cloud is built for one organization.
- Hybrid cloud combines more than one deployment model.

## Important Points for the CCNA Exam

- Know the difference between Type 1 and Type 2 hypervisors.
- Understand that virtualization improves hardware efficiency and flexibility.
- Be able to identify IaaS, PaaS, and SaaS.
- Be able to identify public, private, and hybrid cloud models.

## Real World Example

Instead of buying separate physical servers for email, file storage, and a web app, a company can run multiple virtual machines on one powerful server or move some of those services into the cloud.

## Quick Review

- Virtualization lets many virtual systems run on one physical system.
- Hypervisors manage virtual machines.
- Cloud services are commonly grouped as IaaS, PaaS, and SaaS.
- Cloud deployments can be public, private, or hybrid.

## Key Terms

- Virtualization
- Virtual machine
- Hypervisor
- Type 1
- Type 2
- IaaS
- PaaS
- SaaS
- Public cloud
- Private cloud
- Hybrid cloud

## Mini Practice Questions

1. What is the difference between a Type 1 and Type 2 hypervisor?
2. Which cloud model gives customers complete applications over the internet?
3. What does hybrid cloud mean?$$,
      31,
      12,
      'https://youtu.be/_S3greGajJA'
    ),
    (
      $$network-fundamentals$$,
      $$Containers Fundamentals$$,
      $$containers-fundamentals$$,
      $$See how containers differ from virtual machines and why technologies like Docker and Kubernetes matter in modern IT environments.$$,
      $$## Simple Explanation

Containers are a lightweight way to run applications. Unlike virtual machines, containers do not need a full separate operating system for each workload. They share the host operating system kernel, which makes them faster to start and more efficient to run.

## Key Concepts

- Containers package an application and its needed dependencies.
- Containers share the host operating system kernel.
- Containers are lighter than virtual machines.
- Containers usually start faster than virtual machines.
- Docker is a common container platform.
- Kubernetes is commonly used to manage many containers at scale.

## Important Points for the CCNA Exam

- Know that containers are lighter than virtual machines.
- Remember that containers share the host OS kernel.
- Know Docker as a container technology.
- Know Kubernetes as a container orchestration platform.

## Real World Example

A development team may package a web application inside a Docker container so it runs the same way on a laptop, a test server, and a production platform. If the company uses many containers, Kubernetes can help deploy and manage them.

## Quick Review

- Containers are lightweight application environments.
- They share the host OS kernel.
- Docker is used to create and run containers.
- Kubernetes helps manage containers at larger scale.

## Key Terms

- Container
- Host OS kernel
- Docker
- Kubernetes
- Orchestration
- Virtual machine

## Mini Practice Questions

1. Why are containers usually lighter than virtual machines?
2. Which platform is commonly used to run containers?
3. Which technology is commonly used to manage many containers together?$$,
      32,
      9,
      'https://youtu.be/K731pAS22Aw'
    ),
    (
      $$network-fundamentals$$,
      $$VRF Fundamentals$$,
      $$vrf-fundamentals$$,
      $$Understand how VRF lets one router keep separate routing tables so different groups can stay isolated from each other.$$,
      $$## Simple Explanation

VRF stands for Virtual Routing and Forwarding. It allows one router to keep multiple separate routing tables. This is useful when different departments, customers, or services need to stay isolated even though they share the same physical router.

## Key Concepts

- VRF stands for Virtual Routing and Forwarding.
- A VRF creates a separate routing table.
- Traffic in one VRF is isolated from traffic in another VRF unless extra configuration is added.
- VRF can separate departments, tenants, or customers on shared infrastructure.
- VRF improves logical separation without requiring a completely separate router for each group.

## Important Points for the CCNA Exam

- Know that VRF allows multiple routing tables on one router.
- Understand that VRF is used for traffic isolation.
- Be able to explain why VRF is useful in service provider and enterprise environments.

## Real World Example

An enterprise router may use one VRF for the finance department and another VRF for the engineering department so both groups can use the same router hardware while keeping their routing information separate.

## Quick Review

- VRF creates separate routing tables.
- VRF helps isolate traffic.
- One physical router can support multiple logical routing environments.

## Key Terms

- VRF
- Virtual Routing and Forwarding
- Routing table
- Traffic isolation
- Shared infrastructure

## Mini Practice Questions

1. What does VRF allow one router to keep multiple copies of?
2. Why do organizations use VRF?
3. Does VRF separate traffic logically or physically?$$,
      33,
      9,
      'https://youtu.be/Ge4644KUvh4'
    ),
    (
      $$network-fundamentals$$,
      $$Ethernet LAN Switching Fundamentals$$,
      $$ethernet-lan-switching-fundamentals$$,
      $$Build a beginner-friendly understanding of Ethernet frames, MAC addresses, MAC aging, and how switches learn where devices are connected.$$,
      $$## Simple Explanation

Switches move traffic inside a LAN by looking at MAC addresses. To do that, they read information inside Ethernet frames and keep track of which devices are connected to which switch ports. Once you understand frames, MAC learning, and MAC aging, the rest of switching becomes much easier.

## Key Concepts

- Ethernet frames carry data across a LAN.
- An Ethernet frame includes a preamble, destination MAC address, source MAC address, Type or Length field, payload, and Frame Check Sequence.
- The source MAC address shows who sent the frame.
- The destination MAC address shows who should receive the frame.
- The FCS helps detect errors in the frame.
- A switch learns MAC addresses from the source MAC address of incoming frames.
- Learned MAC addresses are stored in the MAC address table, also called the CAM table.

### 1.13.a MAC learning and aging

- Dynamic MAC entries do not stay in the table forever.
- If a device is inactive long enough, the switch ages out the MAC entry.
- MAC aging helps keep the table accurate if a device moves to another port.
- If the switch needs the address again later, it relearns it from new incoming traffic.

## Important Points for the CCNA Exam

- Be able to name the main Ethernet frame fields at a basic level.
- Know that switches learn from the source MAC address, not the destination MAC address.
- Know that dynamic MAC entries age out after inactivity.
- Know that the MAC address table and CAM table refer to the same idea in many CCNA explanations.
- Understand that switching is a Layer 2 process based on MAC addresses.

## Real World Example

When a PC sends a frame to a printer, the switch records the PC's MAC address on the incoming port. If that PC is disconnected for a long time, the switch can age out the entry. When the PC sends traffic again later, the switch relearns the MAC address on the correct port.

## Quick Review

- Ethernet frames carry LAN traffic.
- MAC addresses identify sending and receiving devices on the LAN.
- Switches learn source MAC addresses.
- The MAC address table stores what the switch has learned.
- Dynamic entries age out if they are inactive long enough.

## Key Terms

- Ethernet frame
- Preamble
- Source MAC address
- Destination MAC address
- Type field
- Payload
- FCS
- MAC learning
- MAC aging
- MAC address table
- CAM table

## Mini Practice Questions

1. Which part of the Ethernet frame does a switch use to learn a new device location?
2. What is another common name for the MAC address table?
3. Why does a switch age out dynamic MAC entries?$$,
      34,
      12,
      'https://youtu.be/u2n762WG0Vo'
    ),
    (
      $$network-fundamentals$$,
      $$Ethernet Switching Forwarding and Flooding$$,
      $$ethernet-switching-forwarding-and-flooding$$,
      $$Learn the basic switch decision process so you can explain when a frame is forwarded normally and when it is flooded.$$,
      $$## Simple Explanation

After a switch learns the source MAC address of an incoming frame, it checks its MAC address table for the destination MAC address. If the destination is known, the frame is forwarded only out the correct port. If the destination is unknown, the switch floods the frame out other ports in the VLAN so the frame can still reach its target.

## Key Concepts

- Step 1: learn the source MAC address on the incoming port.
- Step 2: check the MAC address table for the destination MAC address.
- Step 3: forward the frame if the destination is known.
- Step 4: flood the frame if the destination is unknown.
- Unknown unicast traffic is flooded.
- Broadcast traffic is also flooded within the VLAN.
- Switching decisions are based on Layer 2 information.

## Important Points for the CCNA Exam

- Memorize the basic switch learning process.
- Know why a switch floods unknown destination traffic.
- Understand that flooding happens so the switch can still deliver a frame when it has not learned the destination yet.
- Remember that flooding stays inside the Layer 2 broadcast domain.

## Real World Example

If a switch has never seen a server's MAC address before, the first frame sent to that server is flooded. When the server replies, the switch learns the server's MAC address and can forward later frames directly.

## Quick Review

- Switches learn first, then look up the destination.
- Known destinations are forwarded.
- Unknown destinations are flooded.
- Flooding helps initial communication succeed inside the LAN.

## Key Terms

- Forwarding
- Flooding
- Unknown unicast
- Broadcast
- MAC lookup
- Layer 2

## Mini Practice Questions

1. What does a switch do if the destination MAC address is not in its table?
2. Which address does the switch learn first from an incoming frame?
3. Are switching forwarding decisions based on MAC addresses or IP addresses?$$,
      35,
      11,
      'https://youtu.be/5q1pqdmdPjo'
    ),
    (
      $$network-fundamentals$$,
      $$Analyzing Ethernet Switching, ARP, and Ping$$,
      $$analyzing-ethernet-switching-arp-and-ping$$,
      $$Tie the main switching ideas together by following what happens when hosts use ARP and ping to communicate across a LAN.$$,
      $$## Simple Explanation

When one device wants to ping another device on the same LAN, it may first need to learn the destination MAC address with ARP. The switch helps move the ARP messages and later the ping traffic by learning MAC addresses and forwarding frames to the correct ports. This gives you a full picture of how Layer 2 switching supports Layer 3 communication.

## Key Concepts

- ARP maps an IPv4 address to a MAC address.
- An ARP request is broadcast on the local network.
- The ARP reply is usually unicast back to the requester.
- ping uses ICMP to test connectivity.
- A successful ping often depends on correct addressing and successful ARP resolution first.
- Switches learn MAC addresses while forwarding ARP and ping traffic.

## Important Points for the CCNA Exam

- Know that ARP is used to learn the destination MAC address for IPv4 communication on a LAN.
- Know that ping uses ICMP.
- Be able to describe the order of events at a basic level: ARP first, then data forwarding.
- Understand how switch learning appears during normal host communication.

## Real World Example

A PC wants to ping another PC on the same subnet. It first sends an ARP request asking who owns the target IP address. The switch floods that ARP request. The target PC replies with its MAC address, the switch learns more MAC entries, and then the original PC can send the ICMP echo request.

## Quick Review

- ARP finds the MAC address tied to an IPv4 address.
- ARP requests are broadcast.
- ping uses ICMP to test connectivity.
- Switches support the whole process by learning and forwarding frames.

## Key Terms

- ARP
- ARP request
- ARP reply
- ICMP
- ping
- Echo request
- Echo reply

## Mini Practice Questions

1. What protocol maps an IPv4 address to a MAC address?
2. Is an ARP request normally broadcast or unicast?
3. Which protocol does ping use?$$,
      36,
      11,
      'https://youtu.be/Ig0dSaOQDI8'
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

update public.lessons
set is_published = true
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
and slug in (
  'network-devices-and-their-roles',
  'lan-architectures',
  'interfaces-and-cables',
  'switch-interfaces-and-common-interface-problems',
  'private-ipv4-addressing',
  'ipv6-addressing-fundamentals',
  'ipv6-neighbor-discovery-and-address-types',
  'ipv6-anycast-multicast-and-modified-eui-64',
  'ipv6-neighbor-discovery-and-slaac',
  'configuring-and-verifying-ipv6-addresses',
  'verifying-ip-parameters-on-client-operating-systems',
  'wireless-fundamentals',
  'wifi-channels-and-ssid-basics',
  'wireless-security',
  'virtualization-and-cloud-fundamentals',
  'containers-fundamentals',
  'vrf-fundamentals',
  'ethernet-lan-switching-fundamentals',
  'ethernet-switching-forwarding-and-flooding',
  'analyzing-ethernet-switching-arp-and-ping'
);
