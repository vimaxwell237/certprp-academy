function buildStructuredResponse(
  simpleExplanation: string,
  example: string,
  examNote: string
) {
  return [
    "Simple Explanation",
    simpleExplanation,
    "",
    "Example",
    example,
    "",
    "Important CCNA Exam Note",
    examNote
  ].join("\n");
}

function buildSubnettingResponse() {
  return buildStructuredResponse(
    "Subnetting means dividing one IPv4 network into smaller networks. You borrow bits from the host portion and use them as subnet bits. The more bits you borrow, the more subnets you get, but each subnet has fewer usable hosts.",
    "A /27 leaves 5 host bits. That gives 2^5 = 32 total addresses, and 32 - 2 = 30 usable hosts. The block size is 32, so subnet ranges go 0-31, 32-63, 64-95, and so on.",
    "For CCNA questions, be ready to calculate subnet mask, block size, network address, broadcast address, and usable host range quickly."
  );
}

function buildTcpUdpResponse() {
  return buildStructuredResponse(
    "TCP is connection-oriented and reliable. It uses acknowledgments, sequencing, and retransmissions. UDP is connectionless and faster, but it does not guarantee delivery or ordering.",
    "Web browsing usually uses TCP because the data must arrive correctly. Voice or video apps often use UDP because speed matters more than perfect delivery.",
    "For CCNA, remember: TCP = reliable and connection-oriented, UDP = faster and connectionless."
  );
}

function buildVlanResponse() {
  return buildStructuredResponse(
    "A VLAN is a logical separation inside a switch. It lets one physical switch act like several separate Layer 2 networks.",
    "If a company puts Sales in VLAN 10 and HR in VLAN 20, devices in those VLANs are separated unless a router or Layer 3 switch routes between them.",
    "For CCNA, know that devices in different VLANs need Layer 3 routing for communication."
  );
}

function buildArpResponse() {
  return buildStructuredResponse(
    "ARP maps an IPv4 address to a MAC address on the local network. A device uses ARP when it knows the destination IP but needs the Layer 2 destination MAC.",
    "If PC1 wants to send traffic to 192.168.1.10 on the same subnet, it sends an ARP request asking who owns that IP. The owner replies with its MAC address.",
    "For CCNA, remember that ARP requests are broadcast and ARP replies are usually unicast."
  );
}

function buildOsiResponse() {
  return buildStructuredResponse(
    "The OSI model is a 7-layer reference model used to describe how network communication works. It helps you organize networking concepts and troubleshoot problems by layer.",
    "If a cable is unplugged, that is mainly a Layer 1 problem. If an IP address is wrong, that is mainly a Layer 3 problem.",
    "For CCNA, you should know the 7 layers in order and recognize which devices and protocols mainly operate at each layer."
  );
}

function buildSwitchingResponse() {
  return buildStructuredResponse(
    "Switching is mainly a Layer 2 process. A switch learns source MAC addresses, stores them in its MAC address table, and forwards frames based on destination MAC addresses.",
    "If a switch receives a frame for an unknown destination MAC, it floods the frame out all other ports in that VLAN.",
    "For CCNA, know MAC learning, flooding, forwarding, and MAC aging."
  );
}

function buildRoutingResponse() {
  return buildStructuredResponse(
    "Routing is a Layer 3 process that moves packets between different IP networks. Routers use routing tables to choose the best path.",
    "If a PC in 192.168.1.0/24 needs to reach 10.1.1.0/24, it sends the packet to its default gateway. The router reads the destination IP and forwards the packet toward the correct network.",
    "For CCNA, focus on the difference between switching inside a subnet and routing between subnets."
  );
}

function buildGenericNetworkingResponse() {
  return buildStructuredResponse(
    "This networking topic can usually be understood by asking three questions: what problem does it solve, what layer does it work at, and what information the device uses to make its decision.",
    "For example, ARP solves IP-to-MAC mapping, switching uses MAC addresses, and routing uses IP addresses.",
    "For CCNA, always tie the concept back to packets, frames, addresses, and the OSI/TCP-IP layers."
  );
}

export function buildTutorFallbackResponse(input: {
  question: string;
  lessonContext?: string | null;
}) {
  const source = `${input.lessonContext ?? ""} ${input.question}`.toLowerCase();

  if (source.includes("subnet")) {
    return buildSubnettingResponse();
  }

  if (source.includes("tcp") || source.includes("udp")) {
    return buildTcpUdpResponse();
  }

  if (source.includes("vlan")) {
    return buildVlanResponse();
  }

  if (source.includes("arp")) {
    return buildArpResponse();
  }

  if (source.includes("osi")) {
    return buildOsiResponse();
  }

  if (source.includes("switch")) {
    return buildSwitchingResponse();
  }

  if (source.includes("route")) {
    return buildRoutingResponse();
  }

  return buildGenericNetworkingResponse();
}
