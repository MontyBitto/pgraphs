# pgraph

> Property Graph Exchange Format (PG) parser and serializer

This package implements parsers and serializers to convert between labeled
property graph formats. See [below for an examples](#examples).

## Table of Contents

- [Background](#background)
- [Install](#install)
- [Usage](#usage)
  - [API](#api)
  - [CLI](#cli)
- [Examples](#examples)
  - [PG format](#pg-format)
  - [PG JSON and NDJSON](#pg-json-and-ndjson)
  - [GraphViz DOT](#graphviz-dot)
  - [GraphML](#graphml)
  - [YARS-PG](#yars-pg)
  - [CSV](#csv)
  - [Neptune CSV](#neptune-csv)
  - [TGF](#tgf)
- [License](#license)

## Background

A **property graph** (also known as **labeled property graph**) is an abstract
data structure used in graph databases and related applications. It consists of
**nodes** and **edges** between these nodes. Each edge can be directed or
undirected.  Each of the nodes and edges can have a set of zero or more
**labels** and a set of and zero or more properties. **properties** are
key-value pairs where the same key may have multiple values. **values** are
Unicode strings or scalar values of other data types.

Property graphs applications and formats differ in their model by different
support of data types, restrictions on labels etc. This package implements the
**Property Graph Exchange Format (PG)**, aimed to be a superset of common
models, with parsers and serializers from and to various formats.

A first version of the PG model and its serializations **PG format** and
**PG-JSON** have been proposed by Hirokazu Chiba, Ryota Yamanaka, and Shota
Matsumoto ([2019](https://arxiv.org/abs/1907.03936),
[2022](https://arxiv.org/abs/2203.06393)). Additional information included in
this package:

- [formal description of PG model and format](docs/pg-format.md)
- [illustrating example of PG format](./docs/pg-format.pg)
- [JSON Schema of PG-JSON](pg-schema.json)
- [Example directory](examples), also used for unit tests

## Install

This package has not been published at npm so you need to clone it from its git repository.

~~~
git clone https://github.com/gbv/pg.git
cd pg
npm install
~~~

## Usage

### API

~~~
import { pgformat, ParsingError } from "pgraph"

const graph = {
  nodes: [ ... ],
  edges: [ ... ] 
}

try {
  const pgstring = pgformat.pg.serialize(graph)
  const graph = pgformat.pg.parse(pgstring)
} catch (ParsingError e) {
  console.log(`Parsing failed in line ${e.line}`)
}
~~~

### CLI

The script `bin/pgraph.js` is installed as command `pgraph`:

~~~
Usage: pgraph [options] [<input> [<output]]

Convert between property graph serializations.

Options:
  -f, --from [format]  input format
  -t, --to [format]    output format
  -v, --verbose        verbose error messages
  -h, --help           show usage information
  -V, --version        show the version number

Supported conversion formats:
  pg      from/to PG format (default input)
  json    from/to PG-JSON
  ndjson  from/to PG-NDJSON (default output)
  dot     from/to GraphViz dot
  tgf     from/to Trivial Graph Format
  neo4j   from Neo4J server (via Cypher query)
  xml     to GraphML
  yarspg  to YARS-PG 5.0.0 without data types
  yarspg3 to YARS-PG 3.0.0 with optional labels
  csv     to OpenCypher/Neo4J CSV files
  neptune to Neptune CSV import (aka Gremlin load data format)
~~~

The `neo4j` input format expects a JSON file with Neo4J database URI and
credentials like this and requires to install node package `neo4j-driver` (this
is done automatically by calling `npm install` but not if this package is
installed as dependency of another project):

~~~json
{
  "uri": "neo4j://example.org",
  "user": "alice",
  "password": "secret"
}
~~~

## Examples

### PG format

The [following graph](examples/example.pg) in **PG format** with two nodes and
two edges uses features such as multiple labels, and property values, numbers
and boolean values:

~~~
101 :person name:Alice name:Carol country:"United States"
102 :person :student  name:Bob  country:Japan
101 -- 102  :same_school  :same_class  since:2012
101 -> 102  :likes  since:2015  engaged:false
~~~

### PG JSON and NDJSON

The same graph [in PG-JSON](examples/example.json) and [in
PG-NDJSON](examples/example.ndjson):

~~~json
{
  "nodes": [{
    "id": "101", "labels": [ "person" ],
    "properties": { "name": [ "Alice", "Carol" ], "country": [ "United States" ] }
   },{
    "id": "102", "labels": [ "person", "student" ],
    "properties": { "name": [ "Bob" ], "country": [ "Japan" ] }
  }],
  "edges": [{
    "from": "101", "to": "102", "undirected": true,
    "labels": [ "same_school", "same_class" ], "properties": { "since": [ 2012 ] }
   },{
    "from": "101", "to": "102",
    "labels": [ "likes" ], "properties": { "engaged": [ false ], "since": [ 2015 ] }
  }]
}
~~~

~~~json
{"id":"101","labels":["person"],"properties":{"name":["Alice","Carol"],"country":["United States"]}}
{"id":"102","labels":["person","student"],"properties":{"name":["Bob"],"country":["Japan"]}}
{"from":"101","to":"102","labels":["same_school","same_class"],"properties":{"since":[2012]},"undirected":true}
{"from":"101","to":"102","labels":["likes"],"properties":{"since":[2015],"engaged":[false]}}
~~~

### GraphViz DOT

When exported [to GraphViz DOT](examples/example.dot) format, labels are ignored:

~~~dot
graph {
  101 [country="United States" name=Alice];
  102 [country=Japan name=Bob];
  101 -- 102 [since=2012];
  101 -> 102 [since=2015];
}
~~~

Parsed again from dot to PG format all edges are undirected, except for digraphs:

~~~
101 country:"United States" name:Alice
102 country:Japan name:Bob
101 -- 102 since:2012
101 -- 102 since:2015
~~~

### GraphML

When exported [to GraphML](examples/example.xml), labels are ignored and all
values are converted to strings:

~~~xml
<?xml version="1.0" encoding="UTF-8"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns">
  <graph edgedefault="undirected">
    <node id="101">
      <data key="country">United States</data>
      <data key="name">Alice</data>
      <data key="name">Carol</data>
    </node>
    <node id="102">
      <data key="country">Japan</data>
      <data key="name">Bob</data>
    </node>
    <edge source="101" target="102">
      <data key="since">2012</data>
    </edge>
    <edge source="101" target="102">
      <data key="engaged">false</data>
      <data key="since">2015</data>
    </edge>
  </graph>
</graphml>
~~~

### YARS-PG

Export to YARS-PG 5.0.0 is limited to nodes and edges without schema, so all
property values are mapped to strings:

~~~
(node1{"person"}["country":"United States","name":["Alice","Carol"]])
(node2{"person","student"}["country":"Japan","name":"Bob"])
(node1)-["same_school"]["since":"2012"]-(node2)
(node1)-["likes"]["engaged":"false","since":"2015"]-(node2)
~~~

YARS-PG 3.0.0 supported data types without a schema but labels were mandatory.
The exported format variant lifts this restriction, so the graph [in this
format](examples/example.yarspg) is very similar to [PG format](#pg-format):

~~~
<"101">{"person"}["country":"United States","name":["Alice","Carol"]]
<"102">{"person","student"}["country":"Japan","name":"Bob"]
("101")-["same_school"]["since":2012]-("102")
("101")-["likes"]["engaged":false,"since":2015]-("102")
~~~

### CSV

Property graphs can be stored in form of separate CSV files for nodes and
edges, respectively. An nearly common form these files is supported by Neo4J as
[CSV header format] and by Amazon Neptune as [OpenCypher CSV format]. pgraph
creates four files in `csv` format using the `output` as base name (with
optional directory):

- base + `.nodes.headers` and base + `.nodes.csv` with node data
- base + `.edges.header`, and base + `.edges.csv` with edge data

The example graph is serialized as following, in four files:

~~~csv
:START_ID,:END_ID,:TYPE,since:int,engaged:boolean

101,102,same_school,2012
101,102,likes,2015,false

:ID,:LABEL,name:string[],country:string

101,person,Alice;Carol,United States
102,person;student,Bob,Japan
~~~

Repeated labels and property values are separated by semicolon so 
this character is automactially stripped from labels and property
values. Configuration of this character is not supported yet.

Imported back into a Neo4J database and exported again (with output format
`neo4j`) is serialized as following in PG. Thus conversion of property graphs
between PG and Neo4J or Neptune should be round-trip apart from identifiers,
removal of semicolons, and support of additional data types.

~~~
1 :person country:"United States" name:Alice name:Carol
2 :person :student country:Japan name:Bob
1 -> 2 :same_school since:2012
1 -> 2 :likes engaged:false since:2015
~~~

[CSV header format]: https://neo4j.com/docs/operations-manual/current/tools/neo4j-admin/neo4j-admin-import/#import-tool-header-format 
[OpenCypher CSV format]: https://docs.aws.amazon.com/neptune/latest/userguide/bulk-load-tutorial-format-opencypher.html

### Neptune CSV

Amazon Neptune graph database also supports import of property graph data in
a CSV format called [Gremlin load data
format](https://docs.aws.amazon.com/neptune/latest/userguide/bulk-load-tutorial-format-gremlin.html)
(but only by Amazon, not by Apache TinkerPop community). This CSV format is very similar to
the more common [CSV](#csv) format but it also allows to use semicolon in values, escaped as `\;`.

The example graph is serialized as following, in two files:

~~~csv
~id,~label,name:String[],country:String
101,person,Alice;Carol,United States
102,person;student,Bob,Japan

~id,~from,~to,~label,since:Int,engaged:Bool
0,101,102,same_school,2012
1,101,102,likes,2015,false
~~~

### TGF

The [Trivial Graph Format](https://en.wikipedia.org/wiki/Trivial_Graph_Format)
(TGF) is a text-based format to exchange labeled graphs. It does not support
properties, multiple labels nor line breaks in labels. The example graph is
serialized as following:

~~~tgf
1 person
2 person
#
1 2 same_school
1 2 likes
~~~

Parsed back from TGF and serialized as PG format, this is equivalent to:

~~~
1 :person
2 :person
1 -> 2 :same_school
1 -> 2 :likes
~~~

## License

Licensed under the MIT License.

PG has been created by Hirokazu Chiba, Ryota Yamanaka, and Shota Matsumoto.
See <https://arxiv.org/abs/1907.03936> for reference.

Implementation forked from <https://github.com/g2glab/pg/> by Jakob Voß.
