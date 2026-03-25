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
      $$IPv4 Addressing Fundamentals$$,
      $$ipv4-addressing-fundamentals$$,
      $$Learn how IPv4 addresses are structured, how classes work, and how network, host, and special addresses are identified.$$,
      $$## Simple Explanation

IPv4 addresses are logical addresses used to identify devices on a network. Each IPv4 address has 32 bits and is written as four decimal numbers separated by dots. For the CCNA exam, you should be comfortable reading IPv4 addresses and understanding what part identifies the network and what part identifies the host.

## Key Concepts

- IPv4 is a 32-bit logical addressing system.
- An IPv4 address is made of 4 octets.
- Each octet contains 8 bits.
- Example IPv4 address: 192.168.1.10
- An address has a network portion and a host portion.
- Class A addresses start from 1 to 126 in the first octet.
- Class B addresses start from 128 to 191 in the first octet.
- Class C addresses start from 192 to 223 in the first octet.
- The network address has all host bits set to 0.
- The broadcast address has all host bits set to 1.
- Loopback addresses use 127.0.0.0/8.

## Important Points for the CCNA Exam

- Know that IPv4 addresses are 32 bits long.
- Know that IPv4 addresses are written in dotted decimal format.
- Be able to identify Class A, B, and C ranges at a basic level.
- Know the meaning of network address and broadcast address.
- Remember that 127.0.0.0/8 is used for loopback testing.

## Real World Example

If a PC has the address 192.168.10.25 with a /24 mask, the network is 192.168.10.0 and the broadcast is 192.168.10.255. The PC uses the host portion to identify itself uniquely on that network.

## Quick Review

- IPv4 uses 32-bit addresses.
- Each address has 4 octets.
- Some bits identify the network and some identify the host.
- Network and broadcast addresses are special and cannot be assigned to hosts.
- Loopback addresses are used for local testing.

## Key Terms

- IPv4
- Octet
- Dotted decimal
- Network portion
- Host portion
- Network address
- Broadcast address
- Loopback
- Class A
- Class B
- Class C

## Mini Practice Questions

1. How many bits are in an IPv4 address?
2. What special address has all host bits set to 1?
3. Which class range includes addresses beginning with 192?$$,
      16,
      13,
      'https://youtu.be/3ROdsfEUuhs?si=t19Rx8gjfZs2gje2'
    ),
    (
      $$network-fundamentals$$,
      $$IPv4 Header Basics$$,
      $$ipv4-header-basics$$,
      $$Understand the most important IPv4 header fields and why they matter when packets move across a network.$$,
      $$## Simple Explanation

When a device sends an IPv4 packet, extra information is added to the front of the data. This information is called the IPv4 header. The header helps routers and hosts know where the packet is going, how it should be handled, and whether it needs fragmentation.

## Key Concepts

- An IPv4 packet includes a header and payload.
- TTL means Time To Live.
- TTL helps prevent packets from looping forever.
- The Protocol field identifies the next Layer 4 protocol, such as TCP or UDP.
- The Identification field helps manage fragmentation.
- The Fragment Offset field shows the position of a fragment in the original packet.
- Routers examine header fields to make forwarding decisions.

## Important Points for the CCNA Exam

- Know that TTL helps stop routing loops.
- Know that the Protocol field identifies TCP, UDP, and other upper-layer protocols.
- Know that Identification and Fragment Offset are used for fragmentation.
- Be able to describe the purpose of header fields in simple exam language.

## Real World Example

If a packet is too large for a link, it may be fragmented. The Identification field helps show that the pieces belong together, and the Fragment Offset helps the receiving device place them back in the correct order.

## Quick Review

- The IPv4 header carries control information for the packet.
- TTL prevents packets from circulating forever.
- Protocol identifies the transport protocol.
- Fragment-related fields help manage packet fragmentation.

## Key Terms

- IPv4 header
- TTL
- Protocol field
- Identification
- Fragment Offset
- Fragmentation
- Packet
- Payload

## Mini Practice Questions

1. Which IPv4 header field helps prevent routing loops?
2. Which field identifies whether the packet contains TCP or UDP?
3. Which two header fields are most closely tied to fragmentation?$$,
      17,
      10,
      'https://youtu.be/aQB22y4liXA?si=C_UTFOgMgHTVdxTQ'
    ),
    (
      $$network-fundamentals$$,
      $$Configuring and Verifying IPv4 Addresses$$,
      $$configuring-and-verifying-ipv4-addresses$$,
      $$Practice assigning IPv4 addresses to router interfaces and verifying the configuration with common IOS commands.$$,
      $$## Simple Explanation

Routers need IP addresses on their interfaces so they can communicate with other devices and route traffic between networks. After assigning an address, the interface must be enabled and then verified to make sure the configuration is working.

## Key Concepts

- Router interfaces are configured from interface configuration mode.
- The ip address command assigns an IPv4 address and subnet mask.
- The no shutdown command enables the interface.
- show ip interface brief is a common verification command.
- An interface must have the correct address, mask, and operational state.

## Important Points for the CCNA Exam

- Know the syntax of ip address [ip] [subnet mask].
- Remember that a router interface is administratively down until enabled.
- Know that no shutdown is required on router interfaces in many lab scenarios.
- Know how to use show ip interface brief to verify address and status.

## Real World Example

An administrator configures a router interface with 192.168.1.1 255.255.255.0, enters no shutdown, and then checks show ip interface brief to confirm the interface is up with the correct address.

## Quick Review

- Router interfaces need valid IPv4 addresses.
- The ip address command sets the address and mask.
- no shutdown enables the interface.
- show ip interface brief is a fast way to verify interface settings.

## Key Terms

- ip address
- Subnet mask
- no shutdown
- Interface status
- show ip interface brief
- Router interface

## Mini Practice Questions

1. Which command assigns an IPv4 address to a router interface?
2. Which command enables a router interface that is administratively down?
3. Which verification command gives a quick summary of interface addressing and status?$$,
      18,
      11,
      'https://youtu.be/e1jbvyMeS5I?si=Kr0LWZrhw5gFNV1O'
    ),
    (
      $$network-fundamentals$$,
      $$Subnetting Fundamentals$$,
      $$subnetting-fundamentals$$,
      $$Learn how prefix lengths, borrowed bits, and host bits are used to calculate subnets and usable hosts.$$,
      $$## Simple Explanation

Subnetting divides a larger network into smaller networks. This helps organize addresses, reduce broadcast size, and use address space more efficiently. For CCNA, you need to understand prefix lengths, how many subnets are created, and how many hosts fit inside each subnet.

## Key Concepts

- CIDR uses flexible prefix lengths such as /24 or /27.
- Borrowed bits are bits taken from the host portion to create more subnets.
- Host bits are the bits left for host addresses.
- Number of subnets = 2 raised to the number of borrowed bits.
- Usable hosts = 2 raised to the number of host bits minus 2.
- The minus 2 accounts for the network address and broadcast address.
- Smaller subnets provide fewer hosts but more subnetworks.

## Important Points for the CCNA Exam

- Know what a prefix length means.
- Be able to calculate the number of subnets from borrowed bits.
- Be able to calculate usable hosts from host bits.
- Know why two addresses in each subnet are reserved in normal IPv4 subnetting.
- Be comfortable moving between subnet masks and prefix lengths.

## Real World Example

If a network uses /27 instead of /24, it creates smaller subnets with fewer hosts in each one. This can help separate departments or buildings while using the address range more efficiently.

## Quick Review

- Subnetting breaks a larger network into smaller pieces.
- CIDR uses flexible prefix lengths.
- Borrowed bits create more subnets.
- Host bits determine how many usable hosts fit in each subnet.
- Network and broadcast addresses are reserved.

## Key Terms

- Subnetting
- CIDR
- Prefix length
- Borrowed bits
- Host bits
- Subnet mask
- Usable hosts
- Network address
- Broadcast address

## Mini Practice Questions

1. What does CIDR allow you to change more flexibly than classful addressing?
2. How do you calculate the number of subnets created from borrowed bits?
3. Why do we subtract 2 when calculating usable IPv4 hosts in a normal subnet?$$,
      19,
      15,
      'https://youtu.be/bQ8sdpGQu8c?si=cHT2_5btzF4pqiAC'
    ),
    (
      $$network-fundamentals$$,
      $$VLSM and Advanced Subnetting$$,
      $$vlsm-and-advanced-subnetting$$,
      $$Use Variable Length Subnet Masking to assign different subnet sizes efficiently and avoid wasted address space.$$,
      $$## Simple Explanation

VLSM, or Variable Length Subnet Masking, lets you use different subnet sizes inside the same larger address block. This is useful because not every network needs the same number of hosts. The main rule is to assign addresses to the largest subnet first, then work downward.

## Key Concepts

- VLSM stands for Variable Length Subnet Masking.
- VLSM allows different subnet sizes within one address range.
- Larger networks should be allocated first.
- VLSM reduces wasted address space.
- Good subnet planning depends on counting hosts before assigning prefixes.

## Important Points for the CCNA Exam

- Know that VLSM allows different subnet sizes in the same design.
- Remember the rule: allocate the largest subnet first.
- Be able to explain why VLSM is more efficient than forcing every subnet to be the same size.
- Expect VLSM style subnetting problems on the CCNA exam.

## Real World Example

If one department needs 50 hosts and another needs only 10, VLSM lets you give the larger department a bigger subnet and the smaller department a smaller subnet instead of wasting addresses on both.

## Quick Review

- VLSM uses different subnet sizes in one addressing plan.
- It helps prevent wasted addresses.
- You should always assign the biggest subnet first.
- Careful planning makes subnetting easier and cleaner.

## Key Terms

- VLSM
- Variable Length Subnet Masking
- Prefix
- Address planning
- Host requirement
- Subnet efficiency

## Mini Practice Questions

1. What does VLSM allow you to do that fixed-size subnetting does not?
2. When planning VLSM, which subnet should be allocated first?
3. Why is VLSM useful in real networks?$$,
      20,
      13,
      'https://youtu.be/z-JqCedc9EI?si=dFi3yi9tUqaze0dl'
    ),
    (
      $$network-fundamentals$$,
      $$IPv6 Addressing Fundamentals$$,
      $$ipv6-addressing-fundamentals$$,
      $$Learn how IPv6 addresses are written, shortened, and grouped into the main address types used on modern networks.$$,
      $$## Simple Explanation

IPv6 was created to provide a much larger address space than IPv4. IPv6 addresses are 128 bits long and are written in hexadecimal. They look different from IPv4 addresses, but the main goal is the same: to identify devices on a network.

## Key Concepts

- IPv6 uses 128-bit addresses.
- IPv6 addresses are written in hexadecimal.
- An IPv6 address is separated into blocks by colons.
- Leading zeros can be removed from each block.
- One continuous sequence of zero blocks can be shortened with double colon.
- Global Unicast addresses are used on the public internet.
- Unique Local addresses are used for private internal communication.
- Link Local addresses are used only on the local network segment.

## Important Points for the CCNA Exam

- Know that IPv6 addresses are 128 bits long.
- Know the basic shortening rules for IPv6 notation.
- Remember that you can use double colon only once in a written IPv6 address.
- Know the main IPv6 address types and their prefixes.

## Real World Example

A company may assign Global Unicast IPv6 addresses for routed communication, while every interface also automatically uses a Link Local address to communicate on the local segment.

## Quick Review

- IPv6 uses hexadecimal instead of dotted decimal.
- Leading zeros can be removed.
- One zero sequence can be replaced with double colon.
- Global Unicast, Unique Local, and Link Local are key IPv6 address types.

## Key Terms

- IPv6
- Hexadecimal
- Global Unicast
- Unique Local
- Link Local
- Leading zeros
- Double colon

## Mini Practice Questions

1. How many bits are in an IPv6 address?
2. Can the double colon shortcut be used more than once in the same IPv6 address?
3. Which IPv6 address type is meant for local segment communication only?$$,
      21,
      13,
      'https://youtu.be/ZNuXyOXae5U?si=tMiALwm3pZAxxRmn'
    ),
    (
      $$network-fundamentals$$,
      $$IPv6 Neighbor Discovery and Address Types$$,
      $$ipv6-neighbor-discovery-and-address-types$$,
      $$Understand how IPv6 devices discover neighbors and how key IPv6 address types are used in real networks.$$,
      $$## Simple Explanation

IPv6 does not use ARP like IPv4 does. Instead, it uses Neighbor Discovery Protocol, or NDP, which relies on ICMPv6 messages. NDP helps devices learn about neighbors, routers, and addressing information on the local network.

## Key Concepts

- NDP stands for Neighbor Discovery Protocol.
- NDP replaces ARP in IPv6 networks.
- Neighbor Solicitation is used to ask about a neighboring IPv6 device.
- Neighbor Advertisement is used to reply with address information.
- SLAAC stands for Stateless Address Auto Configuration.
- SLAAC allows hosts to build their own IPv6 addresses using router advertisements.
- Global Unicast addresses use the 2000::/3 range.
- Unique Local addresses use the FD00::/7 range.
- Link Local addresses use the FE80::/10 range.

## Important Points for the CCNA Exam

- Know that NDP replaces ARP in IPv6.
- Know the roles of Neighbor Solicitation and Neighbor Advertisement.
- Understand the basic idea of SLAAC.
- Be able to match the main IPv6 address types to their prefixes.

## Real World Example

When a new host joins an IPv6 network, it can use router advertisements to learn the network prefix and then build its own address with SLAAC. It can then use NDP messages to find nearby devices on the link.

## Quick Review

- NDP is the IPv6 replacement for ARP.
- ICMPv6 carries NDP messages.
- Neighbor Solicitation and Neighbor Advertisement help devices find each other.
- SLAAC lets hosts create their own IPv6 addresses.
- Prefixes help identify the main IPv6 address types.

## Key Terms

- NDP
- ICMPv6
- Neighbor Solicitation
- Neighbor Advertisement
- SLAAC
- Router Advertisement
- Global Unicast
- Unique Local
- Link Local

## Mini Practice Questions

1. What protocol replaces ARP in IPv6?
2. Which ICMPv6 message is used to respond to a neighbor lookup?
3. What does SLAAC allow a host to do?$$,
      22,
      13,
      'https://youtu.be/rwkHfsWQwy8?si=b9F5AV89HMvk5euB'
    ),
    (
      $$network-fundamentals$$,
      $$Configuring and Verifying IPv6 Addresses$$,
      $$configuring-and-verifying-ipv6-addresses$$,
      $$Practice enabling IPv6 routing, assigning IPv6 addresses, and verifying that interfaces are ready to carry IPv6 traffic.$$,
      $$## Simple Explanation

Routers need IPv6 addresses on their interfaces before they can route IPv6 traffic. In Cisco IOS, IPv6 routing must also be enabled globally. After configuration, you should verify the interface addresses and status just like you do with IPv4.

## Key Concepts

- IPv6 routing must be enabled with ipv6 unicast-routing.
- Interfaces can be assigned static IPv6 addresses.
- Link Local and Global Unicast addresses may both be present on an interface.
- Verification is important after configuration.
- Floating static routes can be used as backup routes by giving them a higher administrative distance.

## Important Points for the CCNA Exam

- Remember to enable ipv6 unicast-routing before routing IPv6 traffic.
- Know that IPv6 interfaces can have more than one address type.
- Know the purpose of a floating static route.
- Be ready to verify interface addressing in IPv6 lab scenarios.

## Real World Example

An administrator enables ipv6 unicast-routing on a router, assigns a Global Unicast address to an interface, and then checks the interface to confirm the address is present before testing connectivity to another IPv6 network.

## Quick Review

- IPv6 routing must be enabled first on the router.
- Interfaces can carry both Link Local and Global Unicast addresses.
- Floating static routes are backup routes.
- Verification is an important part of IPv6 configuration.

## Key Terms

- ipv6 unicast-routing
- Global Unicast
- Link Local
- Static route
- Floating static route
- Administrative distance
- IPv6 interface

## Mini Practice Questions

1. Which command enables IPv6 routing on a Cisco router?
2. What is the purpose of a floating static route?
3. Can an IPv6 interface have both a Link Local and a Global Unicast address?$$,
      23,
      11,
      'https://youtu.be/WSBEVFANMmc?si=nCh39q6IO-eA0MPS'
    ),
    (
      $$network-fundamentals$$,
      $$Verifying IP Parameters on Client Operating Systems$$,
      $$verifying-ip-parameters-on-client-operating-systems$$,
      $$Use common Windows, macOS, and Linux commands to check addressing, gateways, DNS settings, and connectivity.$$,
      $$## Simple Explanation

A client device must have correct IP settings before it can communicate on the network. When troubleshooting, you should check the IP address, subnet mask, default gateway, and DNS settings first. Different operating systems use different commands, but the goal is the same.

## Key Concepts

- Important client IP settings include IP address, subnet mask, default gateway, and DNS server.
- Windows commonly uses ipconfig and ipconfig /all.
- macOS commonly uses ifconfig and networksetup.
- Linux commonly uses ip addr and ifconfig.
- ping tests basic connectivity.
- traceroute helps show the path traffic takes across a network.

## Important Points for the CCNA Exam

- Know which commands are commonly used on Windows, macOS, and Linux.
- Know which parameters should be checked first during troubleshooting.
- Understand that ping tests reachability.
- Understand that traceroute helps identify where a path problem may exist.

## Real World Example

A user cannot open websites. A technician checks the client and finds the IP address is correct, but the default gateway is wrong. After correcting the gateway, the user can reach remote networks again.

## Quick Review

- Client devices need correct IP settings to communicate.
- Different operating systems use different verification commands.
- ping checks reachability.
- traceroute helps find where a path issue is happening.

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

1. Which Windows command gives detailed IP configuration information?
2. Which command is commonly used on Linux to view interface addressing?
3. What is the purpose of traceroute?$$,
      24,
      10,
      'https://youtu.be/e1jbvyMeS5I?si=Kr0LWZrhw5gFNV1O'
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
