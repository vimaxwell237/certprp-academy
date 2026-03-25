update public.modules
set
  title = 'IP Connectivity',
  description = 'Routing tables, forwarding decisions, static routes, OSPF, and first hop redundancy for CCNA.',
  order_index = 3,
  is_published = true
where slug = 'ip-connectivity'
  and course_id = (
    select id from public.courses where slug = 'ccna-200-301-preparation'
  );

delete from public.lessons
where module_id = (
  select id
  from public.modules
  where slug = 'ip-connectivity'
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
    ($$3.1 Routing Table Components$$,$$routing-table-components$$,$$Read routing table codes, prefixes, masks, next hops, metrics, and administrative distance in common IOS output.$$,$$## Simple Explanation

A routing table is the list of networks a router knows how to reach. Each entry shows where the destination is, how the router learned about it, and which path should be used next. For the CCNA, you should be comfortable reading route codes, prefixes, masks, next hops, administrative distance, and metrics from basic IOS output.

## Key Concepts

- The routing table stores known destination networks.
- A route code shows the source of the route, such as connected or static.
- The prefix and mask describe the destination network.
- The next hop tells the router where to send the packet next.
- Administrative distance compares route source trust.
- Metric compares paths within the same routing source.

## Important Points for the CCNA Exam

- Know what route codes represent.
- Be able to read prefixes and masks in route output.
- Remember that lower administrative distance is preferred.
- Remember that metrics matter after route source trust is considered.

## Real World Example

A branch router may learn one network through a static route and another through OSPF. The routing table keeps both entries and helps the router decide which path should be used for each packet.

## Quick Review

- Routing tables guide packet forwarding.
- Route codes show where routes came from.
- Prefixes and masks define destination networks.
- Administrative distance and metric help choose between routes.

## Key Terms

- Routing table
- Route code
- Prefix
- Network mask
- Next hop
- Administrative distance
- Metric

## Mini Practice Questions

1. What does a route code tell you?
2. What is the difference between administrative distance and metric?
3. Which part of a route entry identifies the next device in the path?$$,1,12,'https://www.youtube.com/watch?v=aHwAm8GYbn8'),
    ($$3.1 Gateway of Last Resort and Default Routing$$,$$gateway-of-last-resort-and-default-routing$$,$$Understand the default route and why the gateway of last resort matters when no specific route is available.$$,$$## Simple Explanation

If a router does not have a specific route for a destination, it can use a default route instead. Cisco IOS often calls this the gateway of last resort. This gives the router a general path for unknown traffic, which is common on branch routers and internet edges.

## Key Concepts

- A default route is used when no better match exists.
- In IPv4, a default route is `0.0.0.0/0`.
- In IPv6, a default route is `::/0`.
- The gateway of last resort is the next hop for unknown destinations.

## Important Points for the CCNA Exam

- Know the meaning of gateway of last resort.
- Be able to identify IPv4 and IPv6 default routes.
- Remember that more specific routes still beat the default route.

## Real World Example

A small office router may send all internet traffic to one upstream ISP router by using a default route instead of storing many separate routes.

## Quick Review

- Default routes handle unknown destinations.
- The gateway of last resort is the fallback path.
- More specific routes are preferred first.

## Key Terms

- Default route
- Gateway of last resort
- `0.0.0.0/0`
- `::/0`

## Mini Practice Questions

1. What IPv4 prefix represents the default route?
2. When is the gateway of last resort used?
3. Will a default route beat a more specific route?$$,2,10,'https://www.youtube.com/watch?v=YCv4-_sMvYE'),
    ($$3.2 How Routers Make Forwarding Decisions$$,$$router-forwarding-decisions$$,$$Learn how longest prefix match, administrative distance, and metric work together when a router chooses a path.$$,$$## Simple Explanation

Routers follow a decision process when choosing how to forward packets. They first look for the most specific matching route. If more than one route still qualifies, they compare administrative distance. If the routes came from the same source, they compare metrics.

## Key Concepts

- Longest prefix match means the most specific route wins.
- Administrative distance compares route source trustworthiness.
- Metrics compare paths learned from the same routing source.
- Default routes are used only when no better match exists.

## Important Points for the CCNA Exam

- Longest prefix match comes before administrative distance.
- Administrative distance comes before metric when route sources differ.
- Metrics matter when routes come from the same protocol or source.

## Real World Example

A router may know `10.0.0.0/8`, `10.1.0.0/16`, and `10.1.1.0/24`. Traffic for `10.1.1.50` follows the `/24` route because it is the most specific match.

## Quick Review

- Routers pick the most specific route first.
- Administrative distance compares trust.
- Metric compares similar route sources.
- Default routes are the final fallback.

## Key Terms

- Longest prefix match
- Administrative distance
- Metric
- Forwarding decision

## Mini Practice Questions

1. What check happens before administrative distance?
2. When are metrics compared?
3. Why does a `/24` route beat a `/16` route for the same destination?$$,3,11,'https://www.youtube.com/watch?v=aHwAm8GYbn8'),
    ($$3.3 Configure and Verify IPv4 and IPv6 Static Routing$$,$$route-between-networks$$,$$Configure static routes for IPv4 and IPv6 and verify that routers can reach remote networks correctly.$$,$$## Simple Explanation

Static routing means a network engineer manually tells a router how to reach a remote destination. Static routes are useful when the path is simple, predictable, or used as a backup. For the CCNA, you should know how to configure and verify static routing for both IPv4 and IPv6.

## Key Concepts

- Static routes are manually configured.
- Static routes can point to a next-hop address or exit interface.
- IPv4 and IPv6 both support static routes.
- Verification often starts with route-table commands and ping tests.

## Important Points for the CCNA Exam

- Know when static routing is appropriate.
- Remember to verify both the route table and actual reachability.
- Understand that wrong next-hop information breaks forwarding.

## Real World Example

Two branch routers may use static routes to reach each other's LANs. Because the network is small and stable, the administrator can keep the design simple without a dynamic routing protocol.

## Quick Review

- Static routes are manually entered.
- They work in both IPv4 and IPv6.
- Verification includes route tables and traffic testing.

## Key Terms

- Static route
- Next hop
- Exit interface
- Verification

## Mini Practice Questions

1. What is the main difference between static and dynamic routing?
2. Which commands are commonly used to verify static routes?
3. Why can a static route fail even if the command was accepted?$$,4,13,'https://www.youtube.com/watch?v=YCv4-_sMvYE'),
    ($$3.3 Static Routing Lab$$,$$static-routing-lab$$,$$Practice configuring and verifying static routes in a small routed topology.$$,$$## Simple Explanation

A static routing lab helps you move from theory into real router behavior. You configure interfaces, add static routes, verify the routing table, and test end-to-end traffic. This is exactly the kind of workflow that helps with CCNA troubleshooting questions.

## Key Concepts

- Interface addressing must be correct before routing works.
- Static routes must point to the correct destination and next hop.
- Verification includes route-table checks and test traffic.
- Troubleshooting often starts with interface status and addressing.

## Important Points for the CCNA Exam

- Lab questions often mix addressing and routing together.
- A route in the table is not enough if traffic still fails.
- Missing routes and wrong next hops are common mistakes.

## Real World Example

Two routers may be fully configured at the interface level, but the LANs behind them still cannot communicate until the correct static routes are added on both sides.

## Quick Review

- Bring up interfaces first.
- Add routes second.
- Verify both the tables and the traffic.
- Troubleshoot in both directions.

## Key Terms

- Reachability
- Route verification
- Remote network
- Lab workflow

## Mini Practice Questions

1. Why should interfaces be checked before route troubleshooting?
2. Is seeing a static route in the table enough to prove the network works?
3. What are two common reasons a static routing lab fails?$$,5,14,'https://www.youtube.com/watch?v=XHxOtIav2k8'),
    ($$3.3 Default, Network, Host, and Floating Static Routes$$,$$static-route-types-and-floating-statics$$,$$Compare the main static route types used in CCNA scenarios, including backup floating static routes.$$,$$## Simple Explanation

Not all static routes serve the same purpose. A default route handles unknown destinations, a network route reaches a subnet, a host route targets one exact address, and a floating static route acts as a backup path with a higher administrative distance. Knowing these route types makes CCNA static-routing questions much easier.

## Key Concepts

- A default route is a fallback route.
- A network route points to a destination subnet.
- A host route points to one destination address.
- A floating static route is a backup route with higher administrative distance.

## Important Points for the CCNA Exam

- Know the difference between default, network, and host routes.
- Remember that floating statics are backup routes.
- Be able to explain why higher administrative distance keeps a backup inactive.

## Real World Example

A branch router may use OSPF as the main path and a static route over a slower backup link with a higher administrative distance. If OSPF disappears, the floating static route takes over.

## Quick Review

- Default routes catch unknown traffic.
- Network routes reach subnets.
- Host routes reach one exact device.
- Floating statics provide backup routing.

## Key Terms

- Default static route
- Network route
- Host route
- Floating static route

## Mini Practice Questions

1. What makes a floating static route different from a normal static route?
2. Which route type is used for one exact destination host?
3. When would a default static route be used?$$,6,12,'https://www.youtube.com/watch?v=YCv4-_sMvYE'),
    ($$3.4 Single-Area OSPFv2 Fundamentals$$,$$ospf-single-area-fundamentals$$,$$Understand how OSPFv2 works in a single area, including neighbors, router IDs, and basic route exchange.$$,$$## Simple Explanation

OSPF is a dynamic routing protocol that helps routers learn routes automatically. In a single-area design, all routers share their information inside one OSPF area. For the CCNA, focus on how neighbors are formed, how router IDs work, and how routes are learned after adjacency is built.

## Key Concepts

- OSPF is a link-state routing protocol.
- Single-area OSPF keeps all routers in one area.
- Routers use hello packets to discover neighbors.
- A router ID uniquely identifies the router in OSPF.
- After adjacency forms, routers exchange routing information.

## Important Points for the CCNA Exam

- Know that OSPF is dynamic, not manual like static routing.
- Understand the role of hello packets and neighbor relationships.
- Know what a router ID is and why it matters.

## Real World Example

Three routers in one campus can use OSPF to exchange routes automatically. When a new subnet appears on one router, the others learn it without manual route entry.

## Quick Review

- OSPF is a link-state protocol.
- Single-area OSPF keeps routers in one area.
- Neighbors must form before routes are shared.
- Router IDs identify routers inside OSPF.

## Key Terms

- OSPFv2
- Link-state
- Area
- Neighbor
- Router ID

## Mini Practice Questions

1. What type of routing protocol is OSPF?
2. What must happen before routers exchange full OSPF information?
3. What is the purpose of the router ID?$$,7,13,'https://www.youtube.com/watch?v=pvuaoJ9YzoI'),
    ($$3.4 OSPF Part 1 Lab$$,$$ospf-part-1-lab$$,$$Practice initial OSPF configuration and basic verification in a single-area topology.$$,$$## Simple Explanation

The first OSPF lab usually focuses on enabling OSPF, advertising the right networks, and checking whether neighbors form correctly. This turns OSPF theory into practical router behavior and builds the verification habits needed for the CCNA.

## Key Concepts

- Enable OSPF on the correct router interfaces.
- Place interfaces into the correct area.
- Verify neighbors after configuration.
- Check the routing table for learned OSPF routes.

## Important Points for the CCNA Exam

- OSPF lab questions often test wrong network statements or area mistakes.
- Neighbor formation is one of the first troubleshooting checks.
- Routes should be verified after adjacency is confirmed.

## Real World Example

An engineer enables OSPF on three routers, but no routes appear because one interface was placed in the wrong area. Once corrected, neighbors form and the routes are learned.

## Quick Review

- Enable OSPF.
- Advertise the right networks.
- Verify neighbors.
- Verify routes.

## Key Terms

- OSPF process
- Area assignment
- Neighbor verification
- Route verification

## Mini Practice Questions

1. What is one of the first things to check after enabling OSPF?
2. Can OSPF routes be learned if adjacency never forms?
3. Why should the routing table be checked after neighbor verification?$$,8,14,'https://www.youtube.com/watch?v=LeLRWjfylcs'),
    ($$3.4 OSPF Neighbor Adjacencies and Router ID$$,$$ospf-neighbor-adjacencies-and-router-id$$,$$Learn how OSPF neighbors become adjacent and why the router ID is important to the protocol.$$,$$## Simple Explanation

OSPF routers do not exchange full routing information the moment they see each other. They first check whether key settings match well enough to build an adjacency. The router ID matters because it gives each OSPF speaker a unique identity inside the protocol.

## Key Concepts

- Neighbor relationships begin with hello packets.
- Matching settings are required before full adjacency can form.
- The router ID identifies the router inside OSPF.
- Adjacency problems often come from parameter mismatches.

## Important Points for the CCNA Exam

- Know the difference between seeing a neighbor and reaching full adjacency.
- Understand that router IDs must be unique.
- Expect troubleshooting questions about failed adjacency.

## Real World Example

Two routers are connected and both have OSPF enabled, but they do not exchange routes because one important OSPF setting does not match. Once corrected, adjacency forms.

## Quick Review

- OSPF neighbors must match key settings.
- Full adjacency is required for route exchange.
- Router IDs uniquely identify routers in OSPF.

## Key Terms

- Adjacency
- Hello packet
- Router ID
- Neighbor state

## Mini Practice Questions

1. What is the purpose of the OSPF router ID?
2. Does seeing hello traffic always mean full adjacency exists?
3. Why are mismatched OSPF settings important?$$,9,12,'https://www.youtube.com/watch?v=pvuaoJ9YzoI'),
    ($$3.4 OSPF Network Types, DR, and BDR$$,$$ospf-network-types-and-dr-bdr$$,$$Understand OSPF behavior on point-to-point and broadcast links, including DR and BDR elections.$$,$$## Simple Explanation

OSPF behaves differently depending on the network type. On a point-to-point link, only two routers are involved, so the process is simple. On a broadcast network with multiple routers on one segment, OSPF uses a Designated Router and Backup Designated Router to reduce overhead.

## Key Concepts

- Point-to-point links connect two routers directly.
- Broadcast networks can have multiple routers on one segment.
- A DR is the Designated Router.
- A BDR is the Backup Designated Router.
- DR and BDR elections improve efficiency on broadcast segments.

## Important Points for the CCNA Exam

- Know the difference between point-to-point and broadcast OSPF behavior.
- Understand why DR and BDR elections exist.
- Be ready to identify DR and BDR roles from output.

## Real World Example

On a shared Ethernet segment with several routers, OSPF elects a DR and BDR so each router does not need to exchange full information with every other router in the same way.

## Quick Review

- Point-to-point links are simpler for OSPF.
- Broadcast networks may elect a DR and BDR.
- DR and BDR help control protocol overhead.

## Key Terms

- Point-to-point
- Broadcast network
- DR
- BDR
- Election

## Mini Practice Questions

1. Why does OSPF use a DR and BDR on broadcast networks?
2. Is a DR election needed on a point-to-point link?
3. Which OSPF network type is most associated with Ethernet LANs?$$,10,12,'https://www.youtube.com/watch?v=VtzfTA21ht0'),
    ($$3.4 OSPF Part 2 Lab$$,$$ospf-part-2-lab$$,$$Practice additional OSPF verification tasks that reinforce neighbor behavior and network-type understanding.$$,$$## Simple Explanation

The second OSPF lab builds on the first one. Instead of only enabling OSPF, you spend more time reading verification output and understanding how interface behavior affects the protocol. This helps connect OSPF theory to troubleshooting.

## Key Concepts

- Verification becomes deeper as OSPF knowledge grows.
- Interface details affect OSPF behavior.
- Network type affects adjacency and DR or BDR roles.
- Neighbor and route output should be read together.

## Important Points for the CCNA Exam

- Do not stop at basic enablement; learn to read OSPF verification output.
- Be comfortable checking interface-related OSPF details.
- Expect exam questions that combine neighbors, interfaces, and routes.

## Real World Example

An engineer sees that OSPF routes are present, but one router never becomes DR on a shared LAN. By checking interface and neighbor details, the behavior becomes clear.

## Quick Review

- OSPF verification should include more than one command.
- Interface behavior matters.
- Neighbor data and route data should be compared together.

## Key Terms

- OSPF verification
- Interface behavior
- Neighbor output
- Route output

## Mini Practice Questions

1. Why should OSPF verification include both neighbor and route checks?
2. Can interface behavior affect OSPF operation?
3. What does a second OSPF lab usually improve compared with the first one?$$,11,13,'https://www.youtube.com/watch?v=UEyQW-EcnY8'),
    ($$3.4 Advanced Single-Area OSPF Operations$$,$$advanced-single-area-ospf-operations$$,$$Strengthen single-area OSPF knowledge with more operational detail and CCNA-style troubleshooting thinking.$$,$$## Simple Explanation

After learning basic OSPF configuration, you need to understand how the protocol behaves in more detail. This includes cost ideas, neighbor problems, and route-verification logic. Even in one area, OSPF has enough moving parts to make operational thinking important for the CCNA.

## Key Concepts

- OSPF operation depends on matching parameters and correct interface participation.
- Costs influence path selection inside OSPF.
- Hello behavior affects neighbor formation.
- Verification output explains why routes do or do not appear.

## Important Points for the CCNA Exam

- Be able to connect OSPF route choice to cost concepts.
- Expect troubleshooting questions, not only configuration questions.
- Know that missing neighbors often lead to missing routes.

## Real World Example

A router may have OSPF enabled on the correct interfaces, but one route is still missing because adjacency never reached the proper state. Verification reveals the real problem.

## Quick Review

- OSPF requires both correct configuration and correct operation.
- Cost matters for path choice.
- Missing adjacency often means missing routes.

## Key Terms

- OSPF cost
- Path selection
- Troubleshooting
- Verification workflow

## Mini Practice Questions

1. What OSPF idea helps choose one path over another within the protocol?
2. Why can a route be missing even when OSPF is configured?
3. What should troubleshooting usually verify first in OSPF?$$,12,13,'https://www.youtube.com/watch?v=3ew26ujkiDI'),
    ($$3.4 OSPF Part 3 Lab$$,$$ospf-part-3-lab$$,$$Practice deeper OSPF verification and implementation tasks in a single-area network.$$,$$## Simple Explanation

The third OSPF lab pushes verification skills further. Instead of only confirming that OSPF works, you focus on reading protocol output with more confidence and fixing small issues by understanding how OSPF behaves.

## Key Concepts

- Repetition improves OSPF verification skill.
- Small configuration problems can have large routing effects.
- OSPF output should be interpreted, not just memorized.
- Labs help turn protocol theory into faster troubleshooting.

## Important Points for the CCNA Exam

- OSPF questions often combine several ideas in one scenario.
- Learn to reason from output instead of guessing.
- Be ready to identify why a route or neighbor is missing.

## Real World Example

During a maintenance change, an engineer notices that one router is not learning the expected OSPF route. By checking protocol state carefully, the mismatch is found and corrected.

## Quick Review

- OSPF labs build confidence.
- Output interpretation is a major skill.
- Small issues can remove routes.
- Verification should explain the result.

## Key Terms

- Output interpretation
- OSPF lab
- Single-area troubleshooting
- Verification habit

## Mini Practice Questions

1. Why are repeated OSPF labs helpful for the CCNA?
2. What is the risk of only memorizing commands without reading the output?
3. What is one goal of deeper OSPF lab practice?$$,13,14,'https://www.youtube.com/watch?v=Goekjm3bK5o'),
    ($$3.5 First Hop Redundancy Protocol Fundamentals$$,$$first-hop-redundancy-protocol-fundamentals$$,$$Understand why FHRPs provide default-gateway redundancy for end devices in a LAN.$$,$$## Simple Explanation

Hosts usually rely on one default gateway to leave the local network. If that gateway fails, users can lose access to remote resources even when the rest of the network is healthy. First hop redundancy protocols solve this by allowing multiple routers to share a virtual gateway role.

## Key Concepts

- FHRP stands for First Hop Redundancy Protocol.
- FHRPs protect the default gateway for end hosts.
- A virtual IP address can be shared between redundant routers.
- One router is active while another stands by.

## Important Points for the CCNA Exam

- Know the purpose of FHRPs in campus and branch LANs.
- Understand that hosts point to a virtual gateway, not one physical router.
- Be able to explain active and standby roles.

## Real World Example

Two distribution routers can protect the user VLAN gateway in an office. PCs use one virtual default gateway address, and the standby router takes over if the active router fails.

## Quick Review

- FHRPs protect the first-hop gateway.
- End devices use a virtual gateway address.
- Redundant routers improve availability.

## Key Terms

- FHRP
- Default gateway
- Virtual IP
- High availability
- Standby router

## Mini Practice Questions

1. What problem do FHRPs solve?
2. Do hosts normally use the virtual gateway or a physical router IP?
3. Why are active and standby roles useful?$$,14,12,'https://www.youtube.com/watch?v=43WnpwQMolo'),
    ($$3.5 First Hop Redundancy Protocol Lab$$,$$first-hop-redundancy-protocol-lab$$,$$Practice basic FHRP configuration and verification for gateway redundancy.$$,$$## Simple Explanation

An FHRP lab helps you move from theory into practical gateway redundancy. You configure redundant routers, verify the virtual gateway, and observe how failover protects user traffic. For the CCNA, the main value is understanding what normal FHRP behavior looks like and how to verify it.

## Key Concepts

- Configure redundant first-hop devices.
- Verify the virtual gateway and active role.
- Observe how failover should work.
- Confirm that users still have a working gateway after a failure.

## Important Points for the CCNA Exam

- FHRP questions focus on purpose, verification, and failover behavior.
- Be able to connect the virtual gateway idea to real host traffic.
- Verification matters because redundancy must be confirmed.

## Real World Example

An office user may never notice that one default gateway router failed because the standby router took over the virtual gateway role quickly enough to keep traffic moving.

## Quick Review

- FHRP labs focus on gateway continuity.
- Verification should confirm the active device and virtual gateway.
- Failover is the main outcome being tested.

## Key Terms

- Failover
- Virtual gateway
- Standby role
- Redundancy verification

## Mini Practice Questions

1. What should an FHRP lab verify besides basic configuration?
2. Why is failover the key behavior in an FHRP exercise?
3. How does a virtual gateway help end devices during a router failure?$$,15,13,'https://www.youtube.com/watch?v=uho5Z2nFhb8')
) as l(title,slug,summary,content,order_index,estimated_minutes,video_url)
  on true
where m.slug = 'ip-connectivity'
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
 and lesson_target.slug = 'route-between-networks'
where lab.module_id = m.id
  and c.slug = 'ccna-200-301-preparation'
  and m.slug = 'ip-connectivity'
  and lab.slug = 'implement-static-routing-across-branch-routers';

update public.cli_challenges challenge
set lesson_id = lesson_target.id
from public.modules m
join public.courses c on c.id = m.course_id
join public.lessons lesson_target
  on lesson_target.module_id = m.id
 and lesson_target.slug = 'route-between-networks'
where challenge.module_id = m.id
  and c.slug = 'ccna-200-301-preparation'
  and m.slug = 'ip-connectivity'
  and challenge.slug = 'add-a-static-route-for-a-remote-lan';
