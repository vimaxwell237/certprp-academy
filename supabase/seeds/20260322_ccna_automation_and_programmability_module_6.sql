update public.modules
set
  title = 'Automation and Programmability',
  description = 'Automation concepts, controller-based networking, SDN architecture, and API fundamentals for CCNA.',
  order_index = 6,
  is_published = true
where slug = 'automation-and-programmability'
  and course_id = (
    select id from public.courses where slug = 'ccna-200-301-preparation'
  );

delete from public.lessons
where module_id = (
  select id
  from public.modules
  where slug = 'automation-and-programmability'
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
    ($$6.1 Automation and Network Management$$,$$automation-and-network-management$$,$$Understand how automation improves consistency, speed, and visibility in modern network operations.$$,$$## Simple Explanation

Automation helps network teams do repeated work in a more consistent way. Instead of logging in to every device and typing the same commands again and again, engineers can use repeatable workflows to collect data, check configurations, and make controlled changes faster.

For the CCNA, the key idea is not advanced scripting. It is understanding why automation matters to network management. Automation reduces manual effort, lowers the chance of human error, and makes it easier to handle large numbers of devices.

## Key Concepts

- Automation reduces repeated manual tasks.
- Consistency is one of the biggest benefits of automation.
- Automation can improve speed, accuracy, and visibility.
- Repeatable workflows help reduce configuration drift.
- Automation is useful for both data collection and configuration tasks.

## Important Points for the CCNA Exam

- Know why automation helps network operations.
- Be able to connect automation to efficiency and consistency.
- Understand that automation does not remove the need for verification.

## Real World Example

An engineer may need to check the interface status of fifty branch routers. A manual workflow takes time and increases the risk of missed details. An automated workflow can gather the same facts from all routers in a repeatable way.

## Quick Review

- Automation helps with repeated tasks.
- It improves consistency and speed.
- It reduces human error.
- Verification is still important after automation runs.

## Key Terms

- Automation
- Repeatable workflow
- Configuration drift
- Operational efficiency
- Consistency

## Mini Practice Questions

1. What is one major benefit of automation in network management?
2. Does automation remove the need for verification?
3. Why is consistency important in large networks?$$,1,11,'https://www.youtube.com/watch?v=4tsBgMCPVuc'),
    ($$6.2 Traditional Networks vs Controller-Based Networking$$,$$describe-controller-based-networking$$,$$Compare device-by-device administration with controller-based networking models.$$,$$## Simple Explanation

Traditional networks are usually managed one device at a time. Engineers log into routers, switches, and firewalls individually to configure or verify them. Controller-based networking changes that model by moving much of the policy and management logic into a central platform.

For the CCNA, you should understand the high-level difference between these two approaches. Traditional networks rely more on per-device configuration, while controller-based networks focus more on centralized policy, visibility, and automation.

## Key Concepts

- Traditional networks often use per-device CLI management.
- Controller-based networks centralize policy and management logic.
- Controllers can simplify large-scale changes.
- Centralization can improve consistency across many devices.
- Device state still matters even in controller-based designs.

## Important Points for the CCNA Exam

- Know the basic difference between traditional and controller-based management.
- Be able to explain why controller-based networking helps at scale.
- Understand that controllers do not remove the need for operational validation.

## Real World Example

In a traditional branch rollout, an engineer may configure each switch manually. In a controller-based design, the policy can be defined once and pushed consistently to many devices from a central system.

## Quick Review

- Traditional networks are often managed device by device.
- Controller-based networking centralizes policy.
- Centralization supports scale and consistency.
- Validation is still needed after changes.

## Key Terms

- Traditional networking
- Controller-based networking
- Centralized policy
- Per-device CLI
- Scale

## Mini Practice Questions

1. What is a key difference between traditional and controller-based networking?
2. Why do controllers help in larger environments?
3. Does centralized management remove the need to verify device state?$$,2,11,'https://www.youtube.com/watch?v=7HhWCeXDTpA'),
    ($$6.3 Controller-Based Architecture: Overlay, Underlay, and Fabric$$,$$controller-based-architecture-overlay-underlay-and-fabric$$,$$Learn the main SDN architecture ideas behind overlay, underlay, and fabric designs.$$,$$## Simple Explanation

Controller-based and software-defined networks are often described with terms such as overlay, underlay, and fabric. The underlay is the real transport network that carries traffic. The overlay is the logical network built on top of that transport. A fabric is the overall system that ties these parts together and lets the network behave in a more unified way.

For the CCNA, focus on the purpose of these terms rather than deep product details. You should be able to explain that controller-based designs separate the physical transport from the logical services built on top of it.

## Key Concepts

- The underlay is the physical or transport network.
- The overlay is the logical network built on top of the underlay.
- A fabric is the coordinated architecture that ties the system together.
- Overlay designs help abstract services from the physical path.
- Controller-based networks use these ideas to simplify operations and scale.

## Important Points for the CCNA Exam

- Know the basic difference between overlay and underlay.
- Be able to explain fabric at a high level.
- Focus on architecture purpose, not deep implementation details.

## Real World Example

An enterprise may run a stable IP underlay between switches and routers while an overlay provides the logical segmentation and policy behavior seen by users and applications.

## Quick Review

- Underlay is the transport network.
- Overlay is the logical network on top.
- Fabric ties the architecture together.
- These ideas support scalable controller-based design.

## Key Terms

- Overlay
- Underlay
- Fabric
- SDN architecture
- Logical network

## Mini Practice Questions

1. What is the underlay in a controller-based design?
2. What does the overlay provide?
3. Why is the fabric concept useful in SDN discussions?$$,3,12,'https://www.youtube.com/watch?v=7HhWCeXDTpA'),
    ($$6.3 Separation of Control Plane and Data Plane$$,$$separation-of-control-plane-and-data-plane$$,$$Understand why software-defined networking separates decision-making from packet forwarding.$$,$$## Simple Explanation

In traditional devices, the same box often makes forwarding decisions and also forwards the traffic. In software-defined networking, those roles are more clearly separated. The control plane makes decisions about where traffic should go, while the data plane actually forwards the packets.

For the CCNA, this is one of the most important SDN ideas. Separating control and forwarding helps networks become more programmable, easier to manage centrally, and more flexible when policy changes are needed.

## Key Concepts

- The control plane decides how traffic should be handled.
- The data plane forwards the actual packets.
- SDN separates these functions more clearly than many traditional designs.
- Separation supports central policy and programmability.

## Important Points for the CCNA Exam

- Know the difference between control plane and data plane.
- Be able to explain why SDN separates them.
- Understand that central control does not mean packets stop flowing through the actual network devices.

## Real World Example

A controller may define forwarding policy for a group of devices, but the switches still perform the actual packet forwarding in the data plane on the network path.

## Quick Review

- Control plane makes decisions.
- Data plane forwards traffic.
- SDN separates these roles more clearly.
- Separation supports central management and programmability.

## Key Terms

- Control plane
- Data plane
- SDN
- Central policy
- Forwarding decision

## Mini Practice Questions

1. What is the role of the control plane?
2. What is the role of the data plane?
3. Why is separating them useful in SDN?$$,4,11,'https://www.youtube.com/watch?v=7HhWCeXDTpA'),
    ($$6.3 Northbound and Southbound APIs$$,$$northbound-and-southbound-apis$$,$$Understand how northbound and southbound APIs connect controllers, applications, and network devices.$$,$$## Simple Explanation

APIs are the communication methods that let software components exchange information and instructions. In controller-based networking, northbound APIs usually connect the controller to higher-level applications, while southbound APIs connect the controller to the devices or systems it manages.

For the CCNA, the main goal is to understand the direction and purpose of these APIs. Northbound APIs help applications talk to the controller. Southbound APIs help the controller communicate downward to the network infrastructure.

## Key Concepts

- API stands for Application Programming Interface.
- Northbound APIs connect controllers to higher-level systems or applications.
- Southbound APIs connect controllers to network devices or lower-level systems.
- APIs help automation and programmability work at scale.
- Direction matters because each API type serves a different role.

## Important Points for the CCNA Exam

- Know the difference between northbound and southbound APIs.
- Be able to explain how APIs fit into controller-based networking.
- Understand that APIs help software exchange structured requests and responses.

## Real World Example

An automation platform may use a northbound API to ask a controller for network inventory, while the controller uses southbound communication to apply policy or gather state from the devices under its control.

## Quick Review

- APIs let software communicate.
- Northbound means toward applications.
- Southbound means toward devices or lower layers.
- APIs are a major part of controller-based networking.

## Key Terms

- API
- Northbound API
- Southbound API
- Controller
- Structured response

## Mini Practice Questions

1. What does a northbound API usually connect to?
2. What does a southbound API usually connect to?
3. Why are APIs important in controller-based networking?$$,5,11,'https://www.youtube.com/watch?v=7HhWCeXDTpA'),
    ($$6.3 REST APIs and Automation Workflows$$,$$apis-json-and-automation-workflows$$,$$Use REST API ideas and structured data concepts to understand how controllers and automation tools exchange information.$$,$$## Simple Explanation

REST APIs are a common way software systems exchange data. In networking, they are often used so controllers, tools, and scripts can request information or submit changes in a structured format. This makes automation more consistent than copying information manually from device to device.

For the CCNA, focus on the high-level idea that REST APIs support automation by providing machine-readable communication between systems. You do not need deep programming knowledge, but you should know why structured API workflows are useful.

## Key Concepts

- REST APIs are widely used for automation and data exchange.
- Structured data formats make responses easier for software to read.
- API-driven workflows support repeatable operations.
- Controllers often expose information that automation tools can consume.

## Important Points for the CCNA Exam

- Know that REST APIs support automation and programmability.
- Be able to connect APIs to structured, repeatable workflows.
- Understand that API use improves scale compared with manual collection.

## Real World Example

Instead of logging into dozens of devices to copy interface information by hand, an engineer may query a controller API and receive structured results that can be checked automatically.

## Quick Review

- REST APIs help systems exchange information.
- Structured data supports automation.
- API workflows are repeatable and scalable.
- Automation tools often depend on APIs for data collection.

## Key Terms

- REST API
- Structured data
- Automation workflow
- Machine-readable response
- Controller inventory

## Mini Practice Questions

1. Why are REST APIs useful in network automation?
2. What is one advantage of machine-readable responses?
3. How do API workflows improve scale compared with manual collection?$$,6,12,'https://www.youtube.com/watch?v=Luei0p-2h10')
) as l(title,slug,summary,content,order_index,estimated_minutes,video_url)
  on true
where m.slug = 'automation-and-programmability'
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
 and lesson_target.slug = 'describe-controller-based-networking'
where lab.module_id = m.id
  and c.slug = 'ccna-200-301-preparation'
  and m.slug = 'automation-and-programmability'
  and lab.slug = 'validate-controller-data-and-device-inventory';

update public.cli_challenges challenge
set lesson_id = lesson_target.id
from public.modules m
join public.courses c on c.id = m.course_id
join public.lessons lesson_target
  on lesson_target.module_id = m.id
 and lesson_target.slug = 'describe-controller-based-networking'
where challenge.module_id = m.id
  and c.slug = 'ccna-200-301-preparation'
  and m.slug = 'automation-and-programmability'
  and challenge.slug = 'collect-device-facts-for-automation-readiness';
