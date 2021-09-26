class DnsModel {
  DnsModel(this.ipv4Adresses, this.ipv6Adresses, this.mailServers, this.nameServers);

  DnsModel.fromJson(Map<String, dynamic> json)
      : ipv4Adresses = json.containsKey("IPV4 address")
            ? (json["IPV4 address"] as List<dynamic>)
                .map((adr) => adr as String)
                .toList()
            : [],
        ipv6Adresses = json.containsKey("IPV6 address")
            ? (json["IPV6 address"] as List<dynamic>)
                .map((adr) => adr as String)
                .toList()
            : [],
        mailServers = json.containsKey("MX")
            ? (json["MX"] as List<dynamic>)
                .map((adr) => adr["exchange"] as String)
                .toList()
            : [],
        nameServers = json.containsKey("NS")
            ? (json["NS"] as List<dynamic>)
                .map((adr) => adr as String)
                .toList()
            : [];

  List<String> ipv4Adresses;
  List<String> ipv6Adresses;
  List<String> mailServers;
  List<String> nameServers;
}
