update public.modules
set
  title = 'Network Access',
  description = 'VLANs, trunks, switching protocols, wireless access design, management access, and QoS concepts for CCNA.',
  order_index = 2,
  is_published = true
where slug = 'network-access'
  and course_id = (
    select id from public.courses where slug = 'ccna-200-301-preparation'
  );

delete from public.lessons
where module_id = (
  select id
  from public.modules
  where slug = 'network-access'
    and course_id = (
      select id from public.courses where slug = 'ccna-200-301-preparation'
    )
);

insert into public.lessons (
  module_id,
  title,
  slug,
  summary,
  content,
  order_index,
  estimated_minutes,
  video_url,
  is_published
)
select
  m.id,
  l.title,
  l.slug,
  l.summary,
  l.content,
  l.order_index,
  l.estimated_minutes,
  l.video_url,
  true
from public.modules m
join (
  values
    ($$2.1 VLAN Fundamentals$$,$$vlan-fundamentals$$,$$Understand VLANs, VLAN IDs, and broadcast-domain separation.$$,$$## Simple Explanation

A VLAN, or Virtual LAN, is a logical group of switch ports that forms its own Layer 2 network. Even if many devices plug into the same physical switch, the switch can keep them separated by putting them into different VLANs. This means their broadcasts stay separate, their traffic is easier to organize, and the network becomes easier to manage as it grows.

For the CCNA, the big idea is that VLANs create separate broadcast domains on the same switching hardware. They do not replace routing, but they make segmentation possible. Once you understand VLANs clearly, trunking, inter-VLAN routing, voice VLANs, and many campus troubleshooting questions become much easier.

## Key Concepts

- VLAN stands for Virtual LAN.
- A VLAN creates a separate Layer 2 broadcast domain.
- One physical switch can support many VLANs at the same time.
- Devices in the same VLAN can communicate through switching if their addressing also fits.
- Devices in different VLANs need Layer 3 routing to communicate.
- Normal-range VLANs are numbered 1 through 1005.
- VLAN 1 exists by default on Cisco switches.
- VLANs are commonly used to separate user traffic, voice traffic, guest traffic, and management traffic.

## Important Points for the CCNA Exam

- Know that VLANs are a Layer 2 segmentation tool.
- Remember that broadcast traffic stays inside its VLAN unless routing is involved.
- Be able to identify why different departments or services are often placed into different VLANs.
- Know that a switchport must be assigned to the correct VLAN for the connected device to be in the right Layer 2 network.
- Expect simple exam questions that connect VLANs to access ports, trunks, and inter-VLAN communication.

## Real World Example

Imagine a company with an accounting team, a sales team, and IP phones across the office. The switch may place accounting users in VLAN 10, sales users in VLAN 20, and phones in VLAN 30. All of those devices can still plug into the same family of switches, but their traffic stays separated. That makes it easier to control broadcasts, apply policy later, and troubleshoot issues by department or function.

## Quick Review

- VLANs separate Layer 2 traffic on a switch.
- Each VLAN is its own broadcast domain.
- One switch can support many VLANs.
- Different VLANs need routing to communicate.
- VLANs are one of the main building blocks of campus network design.

## Key Terms

- VLAN
- Virtual LAN
- Broadcast domain
- VLAN ID
- Layer 2 segmentation
- Inter-VLAN routing

## Mini Practice Questions

1. What does a VLAN create on a switch?
2. Can hosts in different VLANs communicate without Layer 3 routing?
3. Why do enterprise networks often place users, phones, and management traffic into different VLANs?$$,1,11,'https://youtu.be/cjFzOnm6u1g'),
    ($$2.1 VLAN Configuration and Verification$$,$$vlan-configuration-and-verification$$,$$Create VLANs, assign access ports, and verify the result with common show commands.$$,$$## Simple Explanation

After creating a VLAN, you must place the right interfaces into it. Verification matters because a device can be connected physically but still sit in the wrong VLAN.

For the CCNA, focus on what VLANs separate, how switch ports are assigned, and how VLAN problems usually appear as local reachability or segmentation issues.

## Key Concepts

- Create the VLAN first.
- Use access mode for end-device ports.
- Verify with `show vlan brief`.
- Be able to connect VLAN design to access ports, trunks, and campus segmentation.
- VLAN mistakes often look like switching problems even when the physical link is healthy.

## Important Points for the CCNA Exam

- Know the difference between creating a VLAN and assigning a port.
- Expect troubleshooting based on wrong VLAN membership.
- Look for small configuration errors such as the wrong VLAN ID or wrong switchport assignment.
- CCNA questions often mix VLAN theory with simple switch verification output.

## Real World Example

A finance PC may fail because its port is still in VLAN 1 instead of VLAN 30. This is one of the most common campus-network building blocks, so understanding it makes later trunking and inter-VLAN topics much easier.

## Quick Review

- Create.
- Assign.
- Verify.
- VLAN work usually starts at the switch interface level.
- Correct VLAN membership is one of the first things to verify during switching problems.

## Key Terms

- Access port
- VLAN membership
- `show vlan brief`

## Mini Practice Questions

1. Which command commonly shows VLAN membership?
2. Can a port be up but in the wrong VLAN?
3. Why are VLAN assignments often one of the first things checked during switching troubleshooting?$$,2,12,'https://youtu.be/-tq7f3xtyLQ'),
    ($$2.1 Voice VLAN and Access Ports$$,$$voice-vlan-and-access-ports$$,$$Learn how one switch port can support a data VLAN for a PC and a voice VLAN for an IP phone.$$,$$## Simple Explanation

Many business switch ports carry normal user traffic for a PC and separate voice traffic for an IP phone. This keeps voice easier to manage and protect.

For the CCNA, focus on what VLANs separate, how switch ports are assigned, and how VLAN problems usually appear as local reachability or segmentation issues.

## Key Concepts

- Access ports serve end devices.
- Voice VLANs separate phone traffic from PC traffic.
- One physical port can support both roles.
- Be able to connect VLAN design to access ports, trunks, and campus segmentation.
- VLAN mistakes often look like switching problems even when the physical link is healthy.

## Important Points for the CCNA Exam

- The PC normally uses the access VLAN.
- The phone uses the voice VLAN.
- Look for small configuration errors such as the wrong VLAN ID or wrong switchport assignment.
- CCNA questions often mix VLAN theory with simple switch verification output.

## Real World Example

A desk phone connects to the switch, and the user PC connects through the phone. This is one of the most common campus-network building blocks, so understanding it makes later trunking and inter-VLAN topics much easier.

## Quick Review

- Access VLAN for data.
- Voice VLAN for phones.
- VLAN work usually starts at the switch interface level.
- Correct VLAN membership is one of the first things to verify during switching problems.

## Key Terms

- Voice VLAN
- Access VLAN
- IP phone

## Mini Practice Questions

1. Which device commonly uses a voice VLAN?
2. Does the PC behind the phone use the voice VLAN?
3. Why are VLAN assignments often one of the first things checked during switching troubleshooting?$$,3,10,'https://youtu.be/kGX76QNIjsE'),
    ($$2.1 VLANs Across Multiple Switches$$,$$vlans-across-multiple-switches$$,$$Explain how the same VLAN can exist on several switches by using trunks.$$,$$## Simple Explanation

If VLAN 10 exists on several switches, the links between those switches must carry VLAN 10 traffic. That is why interswitch trunks matter.

For the CCNA, focus on what VLANs separate, how switch ports are assigned, and how VLAN problems usually appear as local reachability or segmentation issues.

## Key Concepts

- VLANs can span many switches.
- Trunks carry multiple VLANs.
- 802.1Q tags frames on trunks.
- Be able to connect VLAN design to access ports, trunks, and campus segmentation.
- VLAN mistakes often look like switching problems even when the physical link is healthy.

## Important Points for the CCNA Exam

- Access links carry one VLAN.
- Trunks let same-VLAN users stay in one Layer 2 domain across switches.
- Look for small configuration errors such as the wrong VLAN ID or wrong switchport assignment.
- CCNA questions often mix VLAN theory with simple switch verification output.

## Real World Example

Sales users on two floors can stay in VLAN 10 across several access switches. This is one of the most common campus-network building blocks, so understanding it makes later trunking and inter-VLAN topics much easier.

## Quick Review

- Same VLAN can exist on many switches.
- Trunks carry it across uplinks.
- VLAN work usually starts at the switch interface level.
- Correct VLAN membership is one of the first things to verify during switching problems.

## Key Terms

- Trunk
- 802.1Q
- Tagged frame

## Mini Practice Questions

1. Why is a trunk needed between switches?
2. What standard tags VLAN traffic on a trunk?
3. Why are VLAN assignments often one of the first things checked during switching troubleshooting?$$,4,11,'https://youtu.be/Jl9OOzNaBDU'),
    ($$2.1 VLAN Practice Lab$$,$$vlan-practice-lab$$,$$Lab-style practice for VLAN creation, access ports, and verification.$$,$$## Simple Explanation

This lesson combines VLAN setup and verification so you can practice the workflow the CCNA expects: create, assign, test, and fix mistakes.

For the CCNA, focus on what VLANs separate, how switch ports are assigned, and how VLAN problems usually appear as local reachability or segmentation issues.

## Key Concepts

- Build VLANs first.
- Assign interfaces carefully.
- Verify before troubleshooting higher layers.
- Be able to connect VLAN design to access ports, trunks, and campus segmentation.
- VLAN mistakes often look like switching problems even when the physical link is healthy.

## Important Points for the CCNA Exam

- Small VLAN mistakes cause common campus issues.
- Show commands are just as important as config commands.
- Look for small configuration errors such as the wrong VLAN ID or wrong switchport assignment.
- CCNA questions often mix VLAN theory with simple switch verification output.

## Real World Example

A printer may be unreachable because its switchport was left in the default VLAN. This is one of the most common campus-network building blocks, so understanding it makes later trunking and inter-VLAN topics much easier.

## Quick Review

- Create VLANs.
- Assign ports.
- Verify output.
- VLAN work usually starts at the switch interface level.
- Correct VLAN membership is one of the first things to verify during switching problems.

## Key Terms

- VLAN table
- Verification
- Access mode

## Mini Practice Questions

1. Why should you verify VLAN membership after configuration?
2. What happens if a host port is in the wrong VLAN?
3. Why are VLAN assignments often one of the first things checked during switching troubleshooting?$$,5,14,'https://youtu.be/iRkFE_lpYgc')
    ,
    ($$2.2 Trunking Fundamentals$$,$$trunking-fundamentals$$,$$Explain why trunk links are needed and how they differ from access ports.$$,$$## Simple Explanation

An access port usually connects to one end device and carries one main data VLAN. A trunk link usually connects network devices such as switches and carries traffic for many VLANs at the same time. Trunking is what allows VLANs to extend across a campus instead of being trapped on one switch.

For the CCNA, the important idea is that access links and trunk links serve different jobs. Access ports are for endpoints. Trunks are for carrying multiple VLANs between devices. If the trunk is not configured correctly, users in one VLAN may work while another VLAN fails, which is why trunk troubleshooting is so common.

## Key Concepts

- Access ports normally carry one VLAN for an endpoint.
- Trunk links carry multiple VLANs between network devices.
- 802.1Q is the common VLAN tagging method you need to know for the CCNA.
- Tagged frames let the receiving device know which VLAN the traffic belongs to.
- The native VLAN is commonly sent untagged.
- Trunks are often used between switches and between switches and Layer 3 devices.
- A trunk can carry user, voice, and management VLANs over one physical interface.

## Important Points for the CCNA Exam

- Know the difference between an access port and a trunk port.
- Understand why a multi-switch VLAN design depends on trunking.
- Be able to explain the basic role of 802.1Q tagging.
- Remember that native VLAN mismatches and allowed VLAN problems are common exam troubleshooting points.
- Expect questions where the trunk is physically up but logically wrong.

## Real World Example

Suppose a school has one access switch on each floor and several VLANs for students, teachers, and phones. The uplinks between those switches must be trunks. Without trunking, each uplink would only carry one VLAN, which would be inefficient and difficult to scale. With trunking, one physical uplink can carry all the needed VLANs together.

## Quick Review

- Access ports usually carry one VLAN.
- Trunks carry many VLANs.
- 802.1Q tags traffic on trunks.
- Native VLAN traffic is commonly untagged.
- A trunk problem may affect only some VLANs, not always all traffic.

## Key Terms

- Trunk port
- Access port
- 802.1Q
- Native VLAN
- Tagged frame
- Allowed VLAN list

## Mini Practice Questions

1. What is the main job of a trunk link?
2. What is the main difference between an access port and a trunk port?
3. Why can a trunk problem affect only some users or services instead of the entire link?$$,6,10,'https://youtu.be/OkPB028l2eE'),
    ($$2.2 DTP and VTP Overview$$,$$dtp-and-vtp-overview$$,$$Introduce DTP and VTP at a safe CCNA level, including why automatic behavior can be risky.$$,$$## Simple Explanation

DTP helps Cisco switches negotiate trunking, and VTP shares VLAN information between switches. Both are useful to understand, but both can cause problems if used carelessly.

For the CCNA, the key idea is that trunks extend VLANs between devices, and a small mismatch on the trunk can affect many users at the same time.

## Key Concepts

- DTP negotiates trunks.
- VTP distributes VLAN information.
- Both are Cisco-focused topics.
- Trunking is a campus-scaling feature because it carries many VLANs over one link.
- Verification is especially important because a trunk may look up while still being logically wrong.

## Important Points for the CCNA Exam

- DTP is Cisco proprietary.
- Many engineers prefer manual trunk configuration.
- Native VLAN and allowed VLAN settings are common troubleshooting targets.
- CCNA questions often use trunk output to test whether you can spot a mismatch quickly.

## Real World Example

An unintended trunk can form if a switch port is left in a dynamic mode. This is why trunk configuration must be treated carefully on interswitch links in real enterprise networks.

## Quick Review

- DTP = trunk negotiation.
- VTP = VLAN advertisement.
- A trunk can fail partially, not only completely.
- Always compare both ends of a trunk when troubleshooting.

## Key Terms

- DTP
- VTP
- Dynamic trunking

## Mini Practice Questions

1. What does DTP do?
2. Why can VTP be risky in production?
3. Why can a trunk problem affect only some VLANs instead of all traffic?$$,7,10,'https://youtu.be/JtQV_0Sjszg'),
    ($$2.2 Configure and Verify Trunk Links$$,$$configure-and-verify-trunk-links$$,$$Configure 802.1Q trunks, allowed VLANs, and native VLAN settings, then verify them.$$,$$## Simple Explanation

Configuring a trunk means allowing an interface to carry many VLANs. After that, you may limit which VLANs cross the link and check whether both ends match.

For the CCNA, the key idea is that trunks extend VLANs between devices, and a small mismatch on the trunk can affect many users at the same time.

## Key Concepts

- Use trunk mode on interswitch links.
- Allowed VLAN lists control what crosses the link.
- Native VLAN should match on both ends.
- Trunking is a campus-scaling feature because it carries many VLANs over one link.
- Verification is especially important because a trunk may look up while still being logically wrong.

## Important Points for the CCNA Exam

- `show interfaces trunk` is a key verification command.
- Native VLAN mismatches are common problems.
- Native VLAN and allowed VLAN settings are common troubleshooting targets.
- CCNA questions often use trunk output to test whether you can spot a mismatch quickly.

## Real World Example

Only one department fails because its VLAN was removed from the allowed list. This is why trunk configuration must be treated carefully on interswitch links in real enterprise networks.

## Quick Review

- Configure.
- Match settings.
- Verify.
- A trunk can fail partially, not only completely.
- Always compare both ends of a trunk when troubleshooting.

## Key Terms

- Allowed VLAN
- Native VLAN
- `show interfaces trunk`

## Mini Practice Questions

1. What command commonly verifies trunks?
2. What happens if the native VLAN does not match?
3. Why can a trunk problem affect only some VLANs instead of all traffic?$$,8,12,'https://youtu.be/MQcCr3QW1vE'),
    ($$2.2 Trunking Lab$$,$$trunking-lab$$,$$Lab-style practice for building and checking a trunk between switches.$$,$$## Simple Explanation

This lesson focuses on the practical side of trunking: build the link, verify the VLANs, and identify the setting that breaks traffic when something is wrong.

For the CCNA, the key idea is that trunks extend VLANs between devices, and a small mismatch on the trunk can affect many users at the same time.

## Key Concepts

- Check both ends of the trunk.
- Verify allowed VLANs.
- Confirm native VLAN behavior.
- Trunking is a campus-scaling feature because it carries many VLANs over one link.
- Verification is especially important because a trunk may look up while still being logically wrong.

## Important Points for the CCNA Exam

- A trunk can be up and still be wrong.
- Lab questions often mix VLAN and trunk troubleshooting.
- Native VLAN and allowed VLAN settings are common troubleshooting targets.
- CCNA questions often use trunk output to test whether you can spot a mismatch quickly.

## Real World Example

Phones fail on one floor because the voice VLAN is missing on the trunk. This is why trunk configuration must be treated carefully on interswitch links in real enterprise networks.

## Quick Review

- Build trunk.
- Verify traffic.
- Troubleshoot mismatch.
- A trunk can fail partially, not only completely.
- Always compare both ends of a trunk when troubleshooting.

## Key Terms

- Trunk mismatch
- Voice VLAN
- Verification

## Mini Practice Questions

1. Can a trunk be up while some VLANs fail?
2. Why should both sides of the link be checked?
3. Why can a trunk problem affect only some VLANs instead of all traffic?$$,9,13,'https://youtu.be/ngTns2vF_44'),
    ($$2.3 CDP and LLDP Fundamentals$$,$$cdp-and-lldp-fundamentals$$,$$Compare Cisco Discovery Protocol with the open-standard LLDP.$$,$$## Simple Explanation

CDP and LLDP help devices learn about directly connected neighbors. CDP is Cisco proprietary, while LLDP works across vendors.

For the CCNA, treat CDP and LLDP as practical troubleshooting tools that help confirm what is connected on the other side of a link.

## Key Concepts

- Both are Layer 2 discovery protocols.
- Both discover directly connected neighbors.
- LLDP is vendor neutral.
- Discovery protocols are useful during installation, topology checks, and troubleshooting.
- They help confirm both device identity and interface relationships.

## Important Points for the CCNA Exam

- Know the Cisco vs open-standard difference.
- Expect neighbor-table interpretation.
- You may be asked to identify whether CDP or LLDP is the better choice in a mixed-vendor environment.
- Neighbor discovery is often part of verifying the physical and data-link layers.

## Real World Example

An engineer can identify the remote switch and interface without tracing the cable manually. In practice, discovery output can save time when diagrams are outdated or cable labels are unclear.

## Quick Review

- CDP and LLDP discover neighbors.
- LLDP is open standard.
- Discovery protocols are about directly connected devices.
- They are verification tools as much as learning topics.

## Key Terms

- CDP
- LLDP
- Neighbor

## Mini Practice Questions

1. Which protocol is vendor neutral?
2. Do these protocols discover distant or directly connected devices?
3. Why are CDP and LLDP especially useful when a topology diagram is incomplete or outdated?$$,10,9,'https://youtu.be/_hnMZBzXRRk')
    ,
    ($$2.3 Configure and Verify CDP and LLDP$$,$$configure-and-verify-cdp-and-lldp$$,$$Use common commands to view, enable, disable, and verify CDP and LLDP.$$,$$## Simple Explanation

This lesson is about operational use. You need to know how to check neighbor details and when it makes sense to disable discovery on certain interfaces.

For the CCNA, treat CDP and LLDP as practical troubleshooting tools that help confirm what is connected on the other side of a link.

## Key Concepts

- `show cdp neighbors`
- `show lldp neighbors`
- Discovery can be managed intentionally.
- Discovery protocols are useful during installation, topology checks, and troubleshooting.
- They help confirm both device identity and interface relationships.

## Important Points for the CCNA Exam

- Verification commands matter.
- Discovery may be disabled for policy or security reasons.
- You may be asked to identify whether CDP or LLDP is the better choice in a mixed-vendor environment.
- Neighbor discovery is often part of verifying the physical and data-link layers.

## Real World Example

CDP may stay enabled internally but be turned off on external-facing links. In practice, discovery output can save time when diagrams are outdated or cable labels are unclear.

## Quick Review

- Use show commands.
- Manage discovery intentionally.
- Discovery protocols are about directly connected devices.
- They are verification tools as much as learning topics.

## Key Terms

- Neighbor table
- Verification
- Interface control

## Mini Practice Questions

1. Which command shows CDP neighbors?
2. Why might discovery be disabled on some interfaces?
3. Why are CDP and LLDP especially useful when a topology diagram is incomplete or outdated?$$,11,10,'https://youtu.be/4s8qqL7R9W8'),
    ($$2.4 EtherChannel Fundamentals$$,$$etherchannel-fundamentals$$,$$Learn why EtherChannel is used and how LACP differs from PAgP.$$,$$## Simple Explanation

EtherChannel lets several physical interfaces work together as one logical link. This gives a network more available bandwidth and better redundancy without making Spanning Tree block every extra path. Instead of treating each cable as a separate connection, the switch treats the bundled group as one logical interface called a port-channel.

For the CCNA, the most important ideas are why EtherChannel exists, why matching member-link settings matter, and how LACP compares with PAgP. If you understand those ideas clearly, later Layer 2 and Layer 3 EtherChannel lessons become much easier.

## Key Concepts

- EtherChannel bundles multiple physical interfaces into one logical link.
- The logical interface is commonly called a port-channel.
- EtherChannel improves bandwidth because multiple links can be used together.
- EtherChannel improves redundancy because the bundle can keep working if one member link fails.
- Spanning Tree treats the bundle as one logical path.
- LACP is the open-standard negotiation protocol for EtherChannel.
- PAgP is Cisco proprietary.
- Member links must have matching settings to join the same EtherChannel.

## Important Points for the CCNA Exam

- Know that EtherChannel helps use parallel links more efficiently.
- Remember that STP sees the EtherChannel as one logical connection.
- Understand the difference between LACP and PAgP.
- Be ready to identify mismatched settings as a reason the channel does not form correctly.
- Expect comparison questions involving separate parallel links versus one logical port-channel.

## Real World Example

A distribution switch may have four uplinks to another switch. If those uplinks are left as separate links, Spanning Tree may block some of them. If they are configured as an EtherChannel, they can all contribute to the same logical connection. That gives more bandwidth, keeps redundancy, and makes the design cleaner.

## Quick Review

- EtherChannel combines several links into one logical interface.
- It improves both bandwidth and redundancy.
- LACP is open standard.
- PAgP is Cisco proprietary.
- Matching configuration across member interfaces is required.

## Key Terms

- EtherChannel
- Port-channel
- LACP
- PAgP
- Logical link
- Member interface

## Mini Practice Questions

1. What two main benefits does EtherChannel provide?
2. Which EtherChannel negotiation protocol is open standard?
3. Why is EtherChannel better than leaving parallel links as separate individual interfaces?$$,12,11,'https://youtu.be/xuo69Joy_Nc'),
    ($$2.4 Configure Layer 2 EtherChannel with LACP$$,$$configure-layer-2-etherchannel-with-lacp$$,$$Configure a switched EtherChannel and verify the logical bundle.$$,$$## Simple Explanation

A Layer 2 EtherChannel is used on switched links. The member interfaces behave together as one logical switchport.

For the CCNA, focus on why EtherChannel is used, what must match on member links, and how the logical bundle behaves differently from separate physical links.

## Key Concepts

- Member interfaces must match.
- LACP active and passive are common exam terms.
- The logical interface is the port-channel.
- EtherChannel improves resiliency while still keeping Spanning Tree behavior manageable.
- Logical bundling reduces the waste that would happen if extra parallel links were simply blocked.

## Important Points for the CCNA Exam

- Mismatched ports do not join the bundle.
- Verify both the bundle and the members.
- Mismatched interfaces are a classic reason a channel fails to form.
- You should be ready to compare Layer 2 and Layer 3 port-channels at a high level.

## Real World Example

One interface may stay out of the channel if its switchport settings do not match the others. That is why EtherChannel is so common on switch uplinks and multilayer switch connections.

## Quick Review

- Match interfaces.
- Build port-channel.
- Verify.
- The logical bundle is what the network mainly uses, not the individual links by themselves.
- Matching configuration is a non-negotiable part of EtherChannel success.

## Key Terms

- Port-channel
- Member link
- LACP active

## Mini Practice Questions

1. What must match for ports to join the channel?
2. What is the logical interface called?
3. Why is EtherChannel usually better than leaving parallel links as separate individual connections?$$,13,12,'https://youtu.be/8gKF2fMMjA8'),
    ($$2.4 Configure Layer 3 EtherChannel with LACP$$,$$configure-layer-3-etherchannel-with-lacp$$,$$Explain how routed EtherChannel differs from switched EtherChannel.$$,$$## Simple Explanation

A Layer 3 EtherChannel is a routed port-channel, not a switchport trunk or access link. It carries IP traffic directly.

For the CCNA, focus on why EtherChannel is used, what must match on member links, and how the logical bundle behaves differently from separate physical links.

## Key Concepts

- Routed EtherChannel uses Layer 3 interfaces.
- The port-channel can have an IP address.
- LACP can still negotiate the bundle.
- EtherChannel improves resiliency while still keeping Spanning Tree behavior manageable.
- Logical bundling reduces the waste that would happen if extra parallel links were simply blocked.

## Important Points for the CCNA Exam

- Layer 3 EtherChannel is routed, not switched.
- Do not confuse it with a trunk port-channel.
- Mismatched interfaces are a classic reason a channel fails to form.
- You should be ready to compare Layer 2 and Layer 3 port-channels at a high level.

## Real World Example

Two multilayer switches may use a routed port-channel for a resilient core link. That is why EtherChannel is so common on switch uplinks and multilayer switch connections.

## Quick Review

- Routed bundle.
- IP on port-channel.
- Still uses LACP.
- The logical bundle is what the network mainly uses, not the individual links by themselves.
- Matching configuration is a non-negotiable part of EtherChannel success.

## Key Terms

- Routed port
- Layer 3 EtherChannel
- Port-channel

## Mini Practice Questions

1. Does a Layer 3 EtherChannel act as a routed or switched link?
2. Can the logical interface have an IP address?
3. Why is EtherChannel usually better than leaving parallel links as separate individual connections?$$,14,12,'https://youtu.be/8gKF2fMMjA8'),
    ($$2.5 STP Fundamentals$$,$$stp-fundamentals$$,$$Understand Layer 2 loops, broadcast storms, and why Spanning Tree exists.$$,$$## Simple Explanation

Redundant links are useful because they provide backup paths if a cable or interface fails. The problem is that redundant paths at Layer 2 can create switching loops. A Layer 2 loop is dangerous because Ethernet frames do not have a built-in mechanism to stop circling the network the way routed packets do. Once a loop forms, frames can keep moving again and again.

Spanning Tree Protocol, or STP, prevents that problem by building one loop-free logical topology from a physically redundant network. Some paths forward traffic and some are held in a blocking state as backups. This gives the network both safety and redundancy.

## Key Concepts

- Layer 2 loops can form when redundant switch links exist without loop prevention.
- Broadcast storms happen when broadcast traffic keeps circulating in a loop.
- Duplicate frames can be seen when the same traffic travels repeatedly around the loop.
- MAC address table instability happens when switches keep learning the same MAC on different interfaces.
- STP blocks some paths logically to keep the topology safe.
- A blocked STP path is usually a backup path, not automatically a broken path.
- STP is one of the most important protections in campus switching.

## Important Points for the CCNA Exam

- Know the classic loop problems: broadcast storms, duplicate frames, and MAC address instability.
- Understand that STP manages redundancy instead of removing it.
- Remember that blocked ports are often normal and expected.
- Be able to explain why Ethernet switching needs loop prevention.
- Use STP fundamentals as the base for root bridge and Rapid PVST+ questions later.

## Real World Example

Imagine two switches connected by multiple paths in a small office. If one broadcast frame enters that topology and no loop prevention exists, the frame can circulate again and again. Very quickly, links become busy, MAC tables become unstable, and users lose connectivity. STP prevents that by deciding which path should forward and which path should wait as a backup.

## Quick Review

- Redundant links improve availability.
- Redundant Layer 2 links can also create loops.
- Loops cause storms, duplicate frames, and MAC instability.
- STP creates a safe loop-free logical path.
- Blocked ports are part of normal loop prevention.

## Key Terms

- STP
- Layer 2 loop
- Broadcast storm
- Duplicate frame
- MAC address instability
- Blocked port

## Mini Practice Questions

1. Why is STP needed in a switched network?
2. What is a broadcast storm?
3. Why can a blocked STP port actually be a sign of healthy loop prevention?$$,15,11,'https://youtu.be/j-bK-EFt9cY')
    ,
    ($$2.5 Root Bridge, Port Roles, and Port States$$,$$root-bridge-port-roles-and-port-states$$,$$Learn how STP chooses the root bridge and determines forwarding or blocked paths.$$,$$## Simple Explanation

STP first chooses a root bridge, then every switch works out the best path toward it. Some ports forward and some block.

For the CCNA, the main habit is to analyze the topology step by step: identify the root bridge, identify forwarding roles, and then explain why another path is blocked.

## Key Concepts

- Root bridge
- Root port
- Designated port
- Blocked path
- Spanning Tree decisions are based on building one safe loop-free topology from redundant physical links.
- Understanding the logic matters more than memorizing isolated terms.

## Important Points for the CCNA Exam

- Identify the root bridge first.
- Blocked ports still receive BPDUs.
- Blocked ports are often a sign of correct STP behavior, not a broken link.
- Rapid PVST+ topics usually focus on faster recovery and operational interpretation.

## Real World Example

In a triangle of switches, STP blocks one path to remove the loop. This kind of reasoning is common in campus troubleshooting when redundant links are present and not every active path should forward at the same time.

## Quick Review

- Find root.
- Find best paths.
- Block extras.
- Always separate physical redundancy from logical forwarding.
- STP questions become easier when you identify the root bridge first.

## Key Terms

- Root bridge
- Root port
- Designated port

## Mini Practice Questions

1. What is the root bridge?
2. Why does STP block some ports?
3. Why is identifying the root bridge usually the first step in an STP problem?$$,16,12,'https://youtu.be/nWpldCc8msY'),
    ($$2.5 STP Toolkit$$,$$stp-toolkit$$,$$Cover PortFast, BPDU Guard, BPDU Filter, Root Guard, and Loop Guard at CCNA level.$$,$$## Simple Explanation

Modern switched networks use extra STP features to make access ports safer and to protect the spanning-tree design from mistakes.

For the CCNA, the main habit is to analyze the topology step by step: identify the root bridge, identify forwarding roles, and then explain why another path is blocked.

## Key Concepts

- PortFast
- BPDU Guard
- BPDU Filter
- Root Guard
- Loop Guard
- Spanning Tree decisions are based on building one safe loop-free topology from redundant physical links.
- Understanding the logic matters more than memorizing isolated terms.

## Important Points for the CCNA Exam

- PortFast is for end-device access ports.
- BPDU Guard is commonly paired with PortFast.
- Blocked ports are often a sign of correct STP behavior, not a broken link.
- Rapid PVST+ topics usually focus on faster recovery and operational interpretation.

## Real World Example

BPDU Guard can protect the network if someone plugs in an unexpected switch on a user port. This kind of reasoning is common in campus troubleshooting when redundant links are present and not every active path should forward at the same time.

## Quick Review

- PortFast speeds access ports.
- Guard features protect the design.
- Always separate physical redundancy from logical forwarding.
- STP questions become easier when you identify the root bridge first.

## Key Terms

- PortFast
- BPDU Guard
- Root Guard

## Mini Practice Questions

1. Which feature is commonly paired with PortFast?
2. Which feature helps stop an unexpected root bridge?
3. Why is identifying the root bridge usually the first step in an STP problem?$$,17,11,'https://youtu.be/zqzppl4LOwk'),
    ($$2.5 STP Verification Lab$$,$$stp-verification-lab$$,$$Lab-style lesson for identifying the root bridge, active paths, and blocked ports.$$,$$## Simple Explanation

This lesson focuses on reading STP output and connecting it to the physical topology. The key skill is explaining why a port forwards or blocks.

For the CCNA, the main habit is to analyze the topology step by step: identify the root bridge, identify forwarding roles, and then explain why another path is blocked.

## Key Concepts

- Find the root bridge first.
- Identify root and designated ports.
- Check blocked paths carefully.
- Spanning Tree decisions are based on building one safe loop-free topology from redundant physical links.
- Understanding the logic matters more than memorizing isolated terms.

## Important Points for the CCNA Exam

- Verification output is often tested.
- A blocked port may be expected, not broken.
- Blocked ports are often a sign of correct STP behavior, not a broken link.
- Rapid PVST+ topics usually focus on faster recovery and operational interpretation.

## Real World Example

An engineer may see a blocked uplink and confirm it is normal STP behavior, not a hardware fault. This kind of reasoning is common in campus troubleshooting when redundant links are present and not every active path should forward at the same time.

## Quick Review

- Read the topology.
- Read the output.
- Match the two.
- Always separate physical redundancy from logical forwarding.
- STP questions become easier when you identify the root bridge first.

## Key Terms

- Verification
- Blocked port
- Topology

## Mini Practice Questions

1. What should you identify first in an STP problem?
2. Is a blocked port always a failure?
3. Why is identifying the root bridge usually the first step in an STP problem?$$,18,13,'https://youtu.be/Ev9gy7B5hx0'),
    ($$2.5 Rapid PVST+ Operations$$,$$rapid-pvst-plus-operations$$,$$Explain why Rapid PVST+ converges faster than older STP.$$,$$## Simple Explanation

Rapid PVST+ keeps the loop-prevention idea of STP but reacts more quickly to link and topology changes. Faster convergence means less disruption when something fails.

For the CCNA, the main habit is to analyze the topology step by step: identify the root bridge, identify forwarding roles, and then explain why another path is blocked.

## Key Concepts

- Faster convergence
- Same goal: loop prevention
- Better recovery after changes
- Spanning Tree decisions are based on building one safe loop-free topology from redundant physical links.
- Understanding the logic matters more than memorizing isolated terms.

## Important Points for the CCNA Exam

- Rapid PVST+ is faster than classic STP.
- It still uses root-based path selection.
- Blocked ports are often a sign of correct STP behavior, not a broken link.
- Rapid PVST+ topics usually focus on faster recovery and operational interpretation.

## Real World Example

If one uplink fails, Rapid PVST+ can move traffic to a backup path faster than older STP. This kind of reasoning is common in campus troubleshooting when redundant links are present and not every active path should forward at the same time.

## Quick Review

- Same purpose.
- Faster recovery.
- Always separate physical redundancy from logical forwarding.
- STP questions become easier when you identify the root bridge first.

## Key Terms

- Rapid PVST+
- Convergence
- Topology change

## Mini Practice Questions

1. What is the main benefit of Rapid PVST+?
2. Does Rapid PVST+ still prevent loops?
3. Why is identifying the root bridge usually the first step in an STP problem?$$,19,11,'https://youtu.be/EpazNsLlPps'),
    ($$2.6 Wireless Architectures Overview$$,$$wireless-architectures-overview$$,$$Compare autonomous APs with controller-based WLANs.$$,$$## Simple Explanation

Wireless networks can be built in different ways depending on size, scale, and management needs. In a small environment, each access point may be configured mostly on its own. That is often called an autonomous AP design. In a larger enterprise, many access points are usually managed through a wireless LAN controller, or WLC, which centralizes configuration, policy, and monitoring.

For the CCNA, you do not need deep wireless design detail. What you do need is a clear understanding of the difference between stand-alone wireless and centrally managed wireless, and why larger organizations usually prefer controller-based architectures.

## Key Concepts

- An autonomous AP is managed mostly as an individual device.
- A controller-based WLAN manages many APs from a central platform.
- Centralized wireless makes policy and monitoring easier at scale.
- Smaller wireless environments may use simpler autonomous designs.
- Larger environments usually need more consistent visibility and control.
- Wireless architecture affects management, troubleshooting, and growth.

## Important Points for the CCNA Exam

- Know the difference between autonomous APs and controller-based WLANs.
- Understand why controller-based wireless is common in enterprise environments.
- Be able to compare small-site simplicity with large-site scalability.
- Remember that architecture choice affects operations, not just signal coverage.
- This blueprint point is mainly about comparison and recognition.

## Real World Example

A coffee shop may use one stand-alone AP that the owner configures directly. A university campus may use hundreds of APs across many buildings, all managed by a controller that keeps SSIDs, security settings, and monitoring consistent. Both use Wi-Fi, but their architecture is different because their operational needs are different.

## Quick Review

- Autonomous APs are managed individually.
- Controller-based WLANs centralize management.
- Larger environments usually benefit from centralized wireless control.
- Architecture affects scale, visibility, and consistency.
- CCNA focuses on understanding the comparison clearly.

## Key Terms

- Autonomous AP
- Controller-based WLAN
- WLC
- Central management
- Enterprise wireless
- Wireless architecture

## Mini Practice Questions

1. What is the main difference between an autonomous AP and a controller-based WLAN?
2. Why do large enterprise wireless networks often prefer controller-based designs?
3. Why is wireless architecture about management and operations, not only about coverage?$$,20,10,'https://youtu.be/uX1h0F6wpBY')
    ,
    ($$2.6 Centralized vs Distributed Wireless Design$$,$$centralized-vs-distributed-wireless-design$$,$$Explain how centralized and distributed wireless designs differ in control and branch behavior.$$,$$## Simple Explanation

Some wireless designs keep control in one central place, while others place more responsibility closer to the edge or branch. This affects management and resilience.

For the CCNA, the goal is not deep wireless design math, but understanding how architecture choices change management style, scale, and operational control.

## Key Concepts

- Centralized control
- Distributed behavior
- Branch tradeoffs
- Wireless architecture affects not only coverage but also management, policy, and troubleshooting workflows.
- Larger environments usually need more centralized visibility and consistency.

## Important Points for the CCNA Exam

- Understand the architecture comparison.
- Different sites may need different designs.
- Compare architectures based on control and operational simplicity, not just on hardware count.
- Enterprise wireless design questions often test whether you understand scale and centralized management.

## Real World Example

A branch may need local wireless behavior if the WAN back to headquarters fails. This is why large campuses and small sites often make different architecture choices even when both use Wi-Fi.

## Quick Review

- Centralized and distributed designs solve different needs.
- Architecture affects operations.
- Wireless architecture is mainly a comparison topic at CCNA level.
- Think in terms of scale, control, and operations.

## Key Terms

- Centralized design
- Distributed design
- Branch WLAN

## Mini Practice Questions

1. Why might branch offices care about distributed behavior?
2. Is one wireless architecture always best?
3. Why do large enterprise wireless networks often choose a different architecture from small office deployments?$$,21,10,'https://youtu.be/uX1h0F6wpBY'),
    ($$2.7 AP Modes$$,$$ap-modes$$,$$Recognize local, FlexConnect, monitor, and sniffer AP modes.$$,$$## Simple Explanation

An AP can run in different modes depending on whether it is serving clients, supporting a branch, or listening to wireless activity for analysis.

For the CCNA, think of AP modes and controller deployment models as different ways to match wireless behavior to branch needs, troubleshooting needs, and enterprise management needs.

## Key Concepts

- Local mode
- FlexConnect
- Monitor mode
- Sniffer mode
- Mode selection affects what job the AP is doing most of the time.
- Controller design affects how consistently policies and services can be applied.

## Important Points for the CCNA Exam

- Know the basic purpose of each mode.
- This is mostly a recognition topic.
- You are usually being tested on recognition and purpose, not on deep implementation detail.
- Connect AP roles and controller roles to real operational needs such as branch support or packet analysis.

## Real World Example

One AP may serve users normally while another temporarily runs in sniffer mode for troubleshooting. That is why enterprise wireless teams care not only about AP coverage, but also about what each AP or controller is responsible for operationally.

## Quick Review

- Different modes mean different jobs.
- Not every AP is only for client service.
- Modes describe AP behavior.
- Deployment models describe controller placement and control style.

## Key Terms

- Local mode
- FlexConnect
- Sniffer mode

## Mini Practice Questions

1. Which mode normally serves clients?
2. Which mode helps capture wireless traffic?
3. Why is it important to understand both AP mode and controller deployment model in an enterprise WLAN?$$,22,10,'https://youtu.be/uX1h0F6wpBY'),
    ($$2.7 Wireless Controller Deployment Models$$,$$wireless-controller-deployment-models$$,$$Explain how WLC placement and deployment model affect enterprise wireless management.$$,$$## Simple Explanation

A WLC can be deployed in ways that support campus-wide or wider enterprise wireless needs. The main CCNA idea is how controllers fit into managing many APs together.

For the CCNA, think of AP modes and controller deployment models as different ways to match wireless behavior to branch needs, troubleshooting needs, and enterprise management needs.

## Key Concepts

- WLC manages many APs.
- Deployment affects scale and operations.
- Controller design connects directly to wireless architecture.
- Mode selection affects what job the AP is doing most of the time.
- Controller design affects how consistently policies and services can be applied.

## Important Points for the CCNA Exam

- Know that WLCs centralize management.
- Keep the topic at a design level.
- You are usually being tested on recognition and purpose, not on deep implementation detail.
- Connect AP roles and controller roles to real operational needs such as branch support or packet analysis.

## Real World Example

A central controller may push SSIDs and policies to APs across many buildings. That is why enterprise wireless teams care not only about AP coverage, but also about what each AP or controller is responsible for operationally.

## Quick Review

- WLC = central control.
- Placement affects operations.
- Modes describe AP behavior.
- Deployment models describe controller placement and control style.

## Key Terms

- WLC
- Controller deployment
- AP adoption

## Mini Practice Questions

1. What is a WLC used for?
2. Why does controller placement matter?
3. Why is it important to understand both AP mode and controller deployment model in an enterprise WLAN?$$,23,10,'https://youtu.be/uX1h0F6wpBY'),
    ($$2.7 Wireless Security in Controller-Based Networks$$,$$wireless-security-in-controller-based-networks$$,$$Show how centralized wireless designs make security policy easier to apply consistently.$$,$$## Simple Explanation

Controller-based wireless designs help apply the same security settings across many APs. That makes authentication and encryption easier to manage at scale.

For the CCNA, think of AP modes and controller deployment models as different ways to match wireless behavior to branch needs, troubleshooting needs, and enterprise management needs.

## Key Concepts

- Central policy
- Consistent authentication
- Consistent encryption
- Mode selection affects what job the AP is doing most of the time.
- Controller design affects how consistently policies and services can be applied.

## Important Points for the CCNA Exam

- Architecture affects security operations.
- Enterprise WLANs often use stronger security than home Wi-Fi.
- You are usually being tested on recognition and purpose, not on deep implementation detail.
- Connect AP roles and controller roles to real operational needs such as branch support or packet analysis.

## Real World Example

A hospital can push secure wireless settings from one controller instead of changing every AP separately. That is why enterprise wireless teams care not only about AP coverage, but also about what each AP or controller is responsible for operationally.

## Quick Review

- Central control helps security.
- Consistency matters.
- Modes describe AP behavior.
- Deployment models describe controller placement and control style.

## Key Terms

- WPA2
- WPA3
- Enterprise WLAN

## Mini Practice Questions

1. Why is controller-based wireless good for security policy?
2. What should stay consistent across APs?
3. Why is it important to understand both AP mode and controller deployment model in an enterprise WLAN?$$,24,10,'https://youtu.be/VvFuieyTTSw'),
    ($$2.8 Management Access Fundamentals$$,$$management-access-fundamentals$$,$$Compare console, Telnet, and SSH access in a CCNA-friendly way.$$,$$## Simple Explanation

Network devices can be managed locally with a console cable or remotely with Telnet or SSH. SSH is preferred because it protects the session with encryption.

For the CCNA, secure management is the main theme here: know which access methods are safe, how SSH is prepared, and why management access should be protected carefully.

## Key Concepts

- Console = local.
- Telnet = remote but insecure.
- SSH = remote and secure.
- Management access is part of the management plane, not ordinary user traffic.
- Security matters because management access gives control over the device itself.

## Important Points for the CCNA Exam

- Know the difference between local and remote management.
- SSH is preferred over Telnet.
- SSH is preferred not because it is remote, but because it protects the session.
- Expect simple setup and verification questions around secure remote access.

## Real World Example

An engineer may use console during an outage and SSH during normal operations. This is a routine part of device hardening before a switch or router is handed over to operations.

## Quick Review

- Console local.
- Telnet weak.
- SSH secure.
- Secure management is a baseline operational practice.
- Remote access should be protected just as carefully as user data.

## Key Terms

- Console
- Telnet
- SSH

## Mini Practice Questions

1. Which remote method is secure?
2. Which method usually requires physical access?
3. Why is secure management access treated as part of device hardening?$$,25,11,'https://youtu.be/AvgYqI2qSD4')
    ,
    ($$2.8 Configure and Verify SSH Access$$,$$configure-and-verify-ssh-access$$,$$Walk through the main CCNA-level SSH setup steps and how to verify them.$$,$$## Simple Explanation

SSH needs a hostname, domain name, local credentials, RSA keys, and VTY settings. After setup, you verify that secure remote login works.

For the CCNA, secure management is the main theme here: know which access methods are safe, how SSH is prepared, and why management access should be protected carefully.

## Key Concepts

- RSA keys
- Local username
- VTY lines
- Management access is part of the management plane, not ordinary user traffic.
- Security matters because management access gives control over the device itself.

## Important Points for the CCNA Exam

- Know the major setup pieces.
- Verification matters as much as setup.
- SSH is preferred not because it is remote, but because it protects the session.
- Expect simple setup and verification questions around secure remote access.

## Real World Example

Operations teams use SSH to manage switches securely from a central workstation. This is a routine part of device hardening before a switch or router is handed over to operations.

## Quick Review

- Prepare device.
- Generate keys.
- Verify remote access.
- Secure management is a baseline operational practice.
- Remote access should be protected just as carefully as user data.

## Key Terms

- RSA
- VTY
- Secure remote login

## Mini Practice Questions

1. What kind of key is generated for SSH?
2. Which lines control remote login behavior?
3. Why is secure management access treated as part of device hardening?$$,26,12,'https://youtu.be/QnHq7iCOtTc'),
    ($$2.9 QoS Fundamentals$$,$$qos-fundamentals$$,$$Understand delay, jitter, packet loss, bandwidth, and why QoS matters.$$,$$## Simple Explanation

Not all traffic reacts to network problems in the same way. A file download can usually survive a little extra delay, but a voice call or live video stream can become choppy very quickly if delay, jitter, or packet loss becomes too high. Quality of Service, or QoS, is the idea of giving traffic different treatment so important or time-sensitive applications perform better when the network is busy.

For the CCNA, the goal is to understand why QoS exists and what problems it tries to reduce. You do not need advanced provider-level tuning, but you do need to know the main QoS terms and why congestion makes them important.

## Key Concepts

- Delay is the time traffic takes to cross the network.
- Jitter is variation in delay.
- Packet loss means packets are dropped.
- Bandwidth is the amount of data that can be carried over a link.
- QoS is about traffic treatment, not just raw link speed.
- Different applications have different tolerance for delay, jitter, and loss.
- Voice and video are common examples of traffic that need better treatment during congestion.

## Important Points for the CCNA Exam

- Know the definitions of delay, jitter, packet loss, and bandwidth.
- Understand that QoS matters most when a link is congested.
- Be able to explain why voice traffic is more sensitive than many data applications.
- Remember that QoS does not create extra bandwidth out of nowhere; it improves treatment when resources are limited.
- Expect concept-based questions before advanced policy detail.

## Real World Example

Imagine a branch office WAN link that is busy with file transfers and backups. If a voice call shares that link without QoS, users may hear delay, breaks, or robotic audio. With QoS, the router can protect voice traffic so the call stays much more usable even while other traffic continues to cross the same connection.

## Quick Review

- Delay, jitter, and loss all affect user experience.
- Voice and video are especially sensitive to these problems.
- QoS helps important traffic during congestion.
- QoS is about treatment and priority, not only bandwidth size.
- Congestion is the main reason QoS becomes important.

## Key Terms

- QoS
- Delay
- Jitter
- Packet loss
- Bandwidth
- Congestion

## Mini Practice Questions

1. What is jitter?
2. Why does QoS matter for voice traffic more than for many file transfers?
3. Why is QoS most important when a link becomes congested?$$,27,10,'https://youtu.be/H6FKJMiiL6E'),
    ($$2.9 QoS Marking, Classification, and Queuing$$,$$qos-marking-classification-and-queuing$$,$$Explain how QoS identifies, marks, and prioritizes traffic at a CCNA concept level.$$,$$## Simple Explanation

QoS starts by identifying traffic, then marking it, then giving it the right treatment when links are busy. Queuing helps decide what gets sent first.

For the CCNA, the key is understanding why some traffic is more sensitive to congestion and how QoS tries to improve treatment when resources are limited.

## Key Concepts

- Classification
- Marking
- Prioritization
- Queuing
- QoS is about traffic treatment, not just raw speed.
- Different applications have different tolerance for delay, jitter, and loss.

## Important Points for the CCNA Exam

- Know the role of each concept.
- QoS is about traffic treatment during congestion.
- Voice and video examples are common because they clearly show why prioritization matters.
- You are usually being tested on concepts such as classification, marking, and queuing rather than complex policy syntax.

## Real World Example

Voice packets may be marked and queued ahead of low-priority bulk data. This is why QoS discussions often center on WAN links or other places where congestion is more likely.

## Quick Review

- Identify traffic.
- Mark traffic.
- Queue traffic.
- QoS matters most when not all traffic can be treated equally.
- Application sensitivity is the reason QoS exists in the first place.

## Key Terms

- Classification
- Marking
- Queuing

## Mini Practice Questions

1. What does classification do?
2. Why is queuing important?
3. Why does QoS become most important when a link is congested?$$,28,11,'https://youtu.be/4vurfhVjcMM')
) as l(title,slug,summary,content,order_index,estimated_minutes,video_url)
  on true
where m.slug = 'network-access'
  and m.course_id = (
    select id from public.courses where slug = 'ccna-200-301-preparation'
  )
on conflict (module_id, slug) do update
set
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  order_index = excluded.order_index,
  estimated_minutes = excluded.estimated_minutes,
  video_url = excluded.video_url,
  is_published = excluded.is_published;

update public.labs lab
set lesson_id = lesson_target.id
from public.modules m
join public.courses c on c.id = m.course_id
join public.lessons lesson_target
  on lesson_target.module_id = m.id
 and lesson_target.slug = 'vlan-practice-lab'
where lab.module_id = m.id
  and c.slug = 'ccna-200-301-preparation'
  and m.slug = 'network-access'
  and lab.slug = 'configure-vlan-segmentation-and-trunks';

update public.cli_challenges challenge
set lesson_id = lesson_target.id
from public.modules m
join public.courses c on c.id = m.course_id
join public.lessons lesson_target
  on lesson_target.module_id = m.id
 and lesson_target.slug = 'vlan-configuration-and-verification'
where challenge.module_id = m.id
  and c.slug = 'ccna-200-301-preparation'
  and m.slug = 'network-access'
  and challenge.slug = 'create-a-vlan-and-prepare-a-trunk';



