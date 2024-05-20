<!-- MD_HUB: ID: generate-command -->
<!-- MD_HUB: LOCK: true -->

# GENERATE COMMAND

- md-hub generate
- lnmd generate

## Set Config in md File

### ROOT FILE

```markdown
<!-- MD_HUB: CONFIG:
skip-hidden: true # optional: default true (ex: ignore .git, .idea, etc)
include: src/**/*,libs/**/*.ts # optional: default empty (all files)
exclude: dist/**/* # optional: default empty (only node_modules)
filenames: README.md,CHANGE_LOG.md # optional: default README.md
output: README_MAIN.md # optional: README.md
-->
```

### OTHERS

#### child file setting

_set file id and link name_

```markdown
<!-- MD_HUB: ID: hoge -->
<!-- MD_HUB: LOCK: true --> # not generate when it true, default false
<!-- MD_HUB: TITLE: GENERATE COMMAND -->
```

or

```markdown
<!-- MD_HUB: ID: hoge -->

# GENERATE COMMAND
```

_set specific target md position_

```markdown
<!-- MD_HUB: LINK_NEXT_LINE:
id: hoge # required
inline: false  # optional: default false
-->
```

_all / children / grandChild / parallel depth link list_

```markdown
<!-- MD_HUB: BEGIN_LINKS:
all: true # optional: default false
linked: false # optional: default false
child: true # optional: default false
grandChild: true # optional: default false
parallel: true # optional: default false
-->

<!-- MD_HUB: END_LINKS: -->
```

## Command Options

```js
  .option('-sh --skip-hidden <boolean>', 'skip read hidden dir, default: true')
  .option('-incl, --include <strings>', 'include dirs, default: [] (all files)')
  .option('-excl, --exclude <strings>', 'ignore dirs, default: node_modules only')
  .option('-f, --filenames <strings>', 'filenames, default: README.md only')
  .option('-o, --output <filename>', 'output filename. default: README.md (replace)')
  .option('-i, --input <filename>', 'target root filename, default: README.md')
```

<!-- MD_HUB: BEGIN_DEFINE_LINKS: -->

<!-- MD_HUB: END_DEFINE_LINKS: -->
