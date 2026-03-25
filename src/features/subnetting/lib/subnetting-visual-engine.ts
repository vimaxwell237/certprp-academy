import {
  calculateBroadcastAddress,
  calculateHostRange,
  calculateNetworkAddress,
  calculateTotalHosts
} from "@/features/subnetting/lib/subnetting-engine";
import type {
  BinaryOctetBreakdown,
  ParsedIpv4Cidr,
  SubnetCalculationStep,
  SubnetVisualCalculationResult
} from "@/types/subnetting";

function clampPrefix(prefix: number) {
  return Math.max(0, Math.min(32, Math.trunc(prefix)));
}

function ipToInt(address: string) {
  const octets = address.split(".").map((part) => Number(part));

  if (
    octets.length !== 4 ||
    octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)
  ) {
    throw new Error("Enter a valid IPv4 address such as 192.168.10.70/26.");
  }

  return (
    (((octets[0] << 24) >>> 0) |
      ((octets[1] << 16) >>> 0) |
      ((octets[2] << 8) >>> 0) |
      (octets[3] >>> 0)) >>>
    0
  );
}

function intToIp(value: number) {
  return [
    (value >>> 24) & 255,
    (value >>> 16) & 255,
    (value >>> 8) & 255,
    value & 255
  ].join(".");
}

function toBinaryOctet(value: number) {
  return value.toString(2).padStart(8, "0");
}

function prefixToMaskInt(prefixLength: number) {
  const prefix = clampPrefix(prefixLength);

  if (prefix === 0) {
    return 0;
  }

  return (0xffffffff << (32 - prefix)) >>> 0;
}

function createBitBreakdown(address: string, prefixLength: number): BinaryOctetBreakdown[] {
  const prefix = clampPrefix(prefixLength);
  const octets = address.split(".").map(Number);

  return octets.map((decimal, index) => {
    const binary = toBinaryOctet(decimal);
    const networkBitsBeforeOctet = Math.min(prefix, index * 8);
    const networkBitsInOctet = Math.max(0, Math.min(prefix - networkBitsBeforeOctet, 8));

    return {
      decimal,
      binary,
      networkBits: binary.slice(0, networkBitsInOctet),
      hostBits: binary.slice(networkBitsInOctet),
      index
    };
  });
}

export function parseIPv4CIDR(input: string): ParsedIpv4Cidr {
  const normalized = input.trim();

  if (!normalized) {
    throw new Error("Enter an IPv4 address with CIDR notation, for example 192.168.10.70/26.");
  }

  const match = normalized.match(
    /^(\d{1,3}(?:\.\d{1,3}){3})\s*\/\s*(\d{1,2})$/
  );

  if (!match) {
    throw new Error("Use IPv4/CIDR format like 10.1.5.130/27.");
  }

  const inputAddress = intToIp(ipToInt(match[1]!));
  const prefixLength = Number(match[2]);

  if (!Number.isInteger(prefixLength) || prefixLength < 0 || prefixLength > 32) {
    throw new Error("Prefix length must be between /0 and /32.");
  }

  return {
    inputAddress,
    prefixLength,
    normalizedInput: `${inputAddress}/${prefixLength}`
  };
}

export function ipv4ToBinaryOctets(address: string, prefixLength: number) {
  return createBitBreakdown(address, prefixLength);
}

export function prefixToSubnetMask(prefixLength: number) {
  return intToIp(prefixToMaskInt(prefixLength));
}

export function subnetMaskToBinary(prefixLength: number) {
  return prefixToSubnetMask(prefixLength)
    .split(".")
    .map((octet) => toBinaryOctet(Number(octet)))
    .join(".");
}

export function getInterestingOctet(prefixLength: number) {
  const prefix = clampPrefix(prefixLength);
  const index = Math.min(3, Math.floor(prefix / 8));
  const maskOctets = prefixToSubnetMask(prefix)
    .split(".")
    .map(Number);
  const value = maskOctets[index] ?? 255;
  const label = ["1st octet", "2nd octet", "3rd octet", "4th octet"][index] ?? "4th octet";

  return {
    index,
    label,
    value
  };
}

export function calculateBlockSize(prefixLength: number) {
  const interestingOctet = getInterestingOctet(prefixLength);

  return interestingOctet.value === 255 ? 1 : 256 - interestingOctet.value;
}

export function findContainingSubnet(address: string, prefixLength: number) {
  const interestingOctet = getInterestingOctet(prefixLength);
  const blockSize = calculateBlockSize(prefixLength);
  const octets = address.split(".").map(Number);
  const subnetStartValue =
    Math.floor((octets[interestingOctet.index] ?? 0) / blockSize) * blockSize;
  const subnetEndValue = Math.min(subnetStartValue + blockSize - 1, 255);
  const networkOctets = [...octets];
  const broadcastOctets = [...octets];

  networkOctets[interestingOctet.index] = subnetStartValue;
  broadcastOctets[interestingOctet.index] = subnetEndValue;

  for (let index = interestingOctet.index + 1; index < 4; index += 1) {
    networkOctets[index] = 0;
    broadcastOctets[index] = 255;
  }

  return {
    blockSize,
    subnetStartValue,
    subnetEndValue,
    containingSubnetStart: intToIp(ipToInt(networkOctets.join("."))),
    containingSubnetEnd: intToIp(ipToInt(broadcastOctets.join(".")))
  };
}

export function calculateUsableHostCount(prefixLength: number) {
  return calculateTotalHosts(prefixLength);
}

export function buildStepByStepExplanation(
  result: Pick<
    SubnetVisualCalculationResult,
    | "prefixLength"
    | "subnetMask"
    | "subnetMaskBinary"
    | "interestingOctetLabel"
    | "interestingOctetValue"
    | "blockSize"
    | "subnetBoundaries"
    | "inputAddress"
    | "containingSubnetStart"
    | "containingSubnetEnd"
    | "networkAddress"
    | "broadcastAddress"
    | "firstUsableHost"
    | "lastUsableHost"
  >
): SubnetCalculationStep[] {
  return [
    {
      id: "prefix-to-mask",
      title: "Step 1: Convert prefix to mask",
      description: `/${result.prefixLength} means ${result.prefixLength} network bits and ${32 - result.prefixLength} host bits. That gives the mask ${result.subnetMask} (${result.subnetMaskBinary}).`
    },
    {
      id: "interesting-octet",
      title: "Step 2: Find the interesting octet",
      description: `The interesting octet is the ${result.interestingOctetLabel} because that is where the mask changes from 1s to 0s. Its mask value is ${result.interestingOctetValue}.`
    },
    {
      id: "block-size",
      title: "Step 3: Find the block size",
      description: `Block size = 256 - ${result.interestingOctetValue} = ${result.blockSize}. So the subnet boundaries in that octet are ${result.subnetBoundaries.join(", ")}.`
    },
    {
      id: "subnet-range",
      title: "Step 4: Find the subnet range",
      description: `${result.inputAddress} falls inside the block ${result.containingSubnetStart} through ${result.containingSubnetEnd}.`
    },
    {
      id: "network-broadcast",
      title: "Step 5: Find network and broadcast",
      description: `The first address in the block is the network address (${result.networkAddress}) and the last address in the block is the broadcast address (${result.broadcastAddress}).`
    },
    {
      id: "host-range",
      title: "Step 6: Find the host range",
      description: `Usable hosts sit between the network and broadcast addresses, so the host range is ${result.firstUsableHost} through ${result.lastUsableHost}.`
    }
  ];
}

function buildCommonMistakeChecks(
  prefixLength: number,
  blockSize: number,
  networkAddress: string,
  broadcastAddress: string,
  usableHosts: number
) {
  return [
    `Do not confuse total addresses with usable hosts. /${prefixLength} gives ${2 ** (32 - prefixLength)} total addresses but only ${usableHosts} usable hosts in a normal subnet.`,
    `Do not forget to subtract 2 for the network and broadcast addresses unless you are working with special /31 point-to-point cases.`,
    `Use the block size ${blockSize} to find the correct subnet boundary before you pick the network address.`,
    `The network address is ${networkAddress}, but the broadcast address is ${broadcastAddress}. Students often swap those two.`
  ];
}

export function buildVisualCalculation(input: string): SubnetVisualCalculationResult {
  const parsed = parseIPv4CIDR(input);
  const subnetMask = prefixToSubnetMask(parsed.prefixLength);
  const subnetMaskBinary = subnetMaskToBinary(parsed.prefixLength);
  const ipBinaryOctets = ipv4ToBinaryOctets(parsed.inputAddress, parsed.prefixLength);
  const maskBinaryOctets = ipv4ToBinaryOctets(subnetMask, parsed.prefixLength);
  const interestingOctet = getInterestingOctet(parsed.prefixLength);
  const blockSize = calculateBlockSize(parsed.prefixLength);
  const subnetBoundaries = Array.from(
    { length: Math.ceil(256 / blockSize) },
    (_, index) => index * blockSize
  ).filter((value) => value <= 255);
  const containingSubnet = findContainingSubnet(parsed.inputAddress, parsed.prefixLength);
  const networkAddress = calculateNetworkAddress(parsed.inputAddress, parsed.prefixLength);
  const broadcastAddress = calculateBroadcastAddress(parsed.inputAddress, parsed.prefixLength);
  const hostRange = calculateHostRange(parsed.inputAddress, parsed.prefixLength);
  const totalAddresses = 2 ** (32 - parsed.prefixLength);
  const usableHosts = calculateUsableHostCount(parsed.prefixLength);
  const summary = `This is a /${parsed.prefixLength} network, so ${parsed.prefixLength} bits are used for the network and ${32 - parsed.prefixLength} bits remain for hosts. That gives ${totalAddresses} total addresses and ${usableHosts} usable hosts.`;
  const rangeExplanation = `${parsed.inputAddress} falls in the ${containingSubnet.subnetStartValue}-${containingSubnet.subnetEndValue} block of the ${interestingOctet.label.toLowerCase()}, so the subnet starts at ${networkAddress} and ends at ${broadcastAddress}.`;

  const result: SubnetVisualCalculationResult = {
    inputAddress: parsed.inputAddress,
    prefixLength: parsed.prefixLength,
    normalizedInput: parsed.normalizedInput,
    subnetMask,
    subnetMaskBinary,
    ipBinaryOctets,
    maskBinaryOctets,
    interestingOctetIndex: interestingOctet.index,
    interestingOctetLabel: interestingOctet.label,
    interestingOctetValue: interestingOctet.value,
    blockSize,
    subnetBoundaries,
    containingSubnetStart: containingSubnet.containingSubnetStart,
    containingSubnetEnd: containingSubnet.containingSubnetEnd,
    networkAddress,
    broadcastAddress,
    firstUsableHost: hostRange.firstHost,
    lastUsableHost: hostRange.lastHost,
    totalAddresses,
    usableHosts,
    summary,
    rangeExplanation,
    commonMistakes: buildCommonMistakeChecks(
      parsed.prefixLength,
      blockSize,
      networkAddress,
      broadcastAddress,
      usableHosts
    ),
    steps: []
  };

  result.steps = buildStepByStepExplanation(result);

  return result;
}
