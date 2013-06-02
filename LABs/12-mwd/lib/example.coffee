
foo = "bar"
[red,blue] = ["#f00", "#00f"]
console.log foo, red, blue
# prints: foo #f00 #00f



mydata =
  prop1: "a"
  prop2: ["b","c"]
  prop3:
    subprop1: "d"
    subprop2: true
    subprop3: 100

console.log mydata
# prints: { prop1: ... }



add = (x,y) -> x + y

console.log add 1, 2
# prints: 3



show = true
val = 8
msg = "val is #{val}" if val == 8 and show?

console.log msg
# prints: val is 8


eat = (food) -> console.log "bite #{food}"
eat food for food in ['toast', 'cheese']
# prints: bite toast \ bite cheese

onetwothree = (n for n in [1..3])
console.log onetwothree
# prints: [ 1, 2, 3 ]

obj = { p1:1, p2:2, p3:3, p4:4}
console.log "#{p}=#{obj[p]}" for p of obj when 0 == obj[p] % 2
# prints p2=2 \ p4=4 


class ToDoItem
  text: ''
  done: false
  constructor: (text) -> @text = text
  print: -> console.log "#{@text}, done:#{@done}"

todos = [ 
  new ToDoItem('earn money'),
  new ToDoItem('pay bills'),
]

todo.print() for todo in todos
# prints:
#   earn money, done:false
#   pay bills, done:false



class ToDoItemStatic
  @prefix: 'TODO:'
  text: ''
  done: false
  constructor: (text) -> @text = text
  print: 
    -> console.log "#{ToDoItemStatic.prefix} #{@text}, done:#{@done}"

todos = [ 
  new ToDoItemStatic('earn money'),
  new ToDoItemStatic('pay bills'),
]

todo.print() for todo in todos
# prints:
#   TODO: earn money, done:false
#   TODO: pay bills, done:false



class ToDoWhen extends ToDoItem
  constructor: (text) -> 
    super(text)
    @due = 'today'
  print: 
    -> console.log \
      "#{@text}, done:#{@done}, due:#{@due}"

todos = [ 
  new ToDoWhen('earn money'),
  new ToDoWhen('pay bills'),
]

todo.print() for todo in todos
# prints:
#   earn money, done:false, due:today
#   pay bills, done:false, due:today



