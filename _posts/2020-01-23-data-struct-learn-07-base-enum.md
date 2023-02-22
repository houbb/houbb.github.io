---
layout: post
title: 五大基本算法之穷举算法
date:  2020-1-23 10:09:32 +0800
categories: [Data-Struct]
tags: [data-struct, algorithm, sh]
published: true
---

# 穷举

## 定义

穷举法又称穷举搜索法，是一种在问题域的解空间中对所有可能的解穷举搜索，并根据条件选择最优解的方法的总称。

数学上也把穷举法称为枚举法，就是在一个由有限个元素构成的集合中，把所有元素一一枚举研究的方法。

使用穷举法解决问题，基本上就是以下两个步骤：

1. 确定问题的解（或状态）的定义、解空间的范围以及正确解的判定条件；

2. 根据解空间的特点来选择搜索策略，逐个检验解空间中的候选解是否正确；

穷举是用计算机求解问题最常用的方法之一，常用来解决那些通过公式推导、规则演绎的方法不能解决的问题。

采用穷举法求解一个问题时，通常先建立一个数学模型，包括一组变量、以及这些变量需要满足的条件。

问题求解的目标就是确定这些变量的值。根据问题的描述和相关的知识，能为这些变量分别确定一个大概的取值范围。

**在这个范围内对变量依次取值，判断所取的值是否满足数学模型中的条件，直到找到全部符合条件的值为止。**

## 基本概念

### 解空间的定义

解空间就是全部可能的候选解的一个约束范围，确定问题的解就在这个约束范围内，将搜索策略应用到这个约束范围就可以找到问题的解。

要确定解空间，首先要定义问题的解并建立解的数据模型。

如果解的数据模型选择错误或不合适，则会导致解空间结构繁杂、范围难以界定，甚至无法设计穷举算法。

### 穷举解空间的策略

穷举解空间的策略就是搜索算法的设计策略，根据问题的类型，解空间的结构可能是线性表、集合、树或者图，对于不同类型的解空间，需要设计与之相适应的穷举搜索算法。简单的问题可以用通用的搜索算法，比如线性搜索算法用于对线性解空间的搜索，广度优先和深度优先的递归搜索算法适用于树型解空间或更复杂的图型解空间。

### 盲目搜索和启发式搜索

对于线性问题的盲目搜索，就是把线性表中的所有算法按照一定的顺序遍历一遍，对于复杂问题的盲目搜索，常用广度优先搜索和深度优先搜索这两种盲目搜索算法。

如果搜索能够智能化一点，利用搜索过程中出现的额外信息直接跳过一些状态，避免盲目的、机械式的搜索，就可以加快搜索算法的收敛，这就是启发性搜索。

启发性搜索需要一些额外信息和操作来“启发”搜索算法，根据这些信息的不同，启发的方式也不同。

### 剪枝策略

对解空间穷举搜索时，如果有一些状态节点可以根据问题提供的信息明确地被判定为不可能演化出最优解，也就是说，**从此节点开始遍历得到的子树，可能存在正确的解，但是肯定不是最优解，就可以跳过此状态节点的遍历，这将极大地提高算法的执行效率，这就是剪枝策略**，应用剪枝策略的难点在于如何找到一个评价方法（估值函数）对状态节点进行评估。

特定的评价方法都附着在特定的搜索算法中，比如博弈树算法中常用的极大极小值算法和“α-β”算法，都伴随着相应的剪枝算法。

### 剪枝和启发

剪枝不是启发性搜索。

剪枝的原理是在结果已经搜索出来或部分搜索出来（比如树的根节点已经搜索出来了，但是叶子节点还没有搜索出来）的情况下，根据最优解的判断条件，确定这个方向上不可能存在最优解，从而放弃对这个方向的继续搜索。

而启发性搜索通常是根据启发函数给出的评估值，在结果出来之前就朝着最可能出现最优解的方向搜索。

它们的差异点在于是根据结果进行判断还是根据启发函数的评估值进行判断。

### 搜索算法的评估和收敛

收敛原则是只要能找到一个比较好的解就返回（不求最好），根据解的评估判断是否需要继续下一次搜索。

大型棋类游戏通常面临这种问题，比如国际象棋和围棋的求解算法，想要搜索整个解空间得到最优解目前是不可能的，所以此类搜索算法通常都通过一个搜索深度参数来控制搜索算法的收敛，当搜索到指定的深度时（相当于走了若干步棋）就返回当前已经找到的最好的结果，这种退而求其次的策略也是不得已而为之。

## 基本思想

穷举法（枚举法）的基本思想是：列举出所有可能的情况，逐个判断有哪些是符合问题所要求的条件，从而得到问题的全部解答。

它利用计算机运算速度快、精确度高的特点，对要解决问题的所有可能情况，一个不漏地进行检查，从中找出符合要求的答案。

## 分析的角度

用穷举算法解决问题，通常可以从两个方面进行分析。

（1）问题所涉及的情况：问题所涉及的情况有哪些，情况的种数可不可以确定。把它描述出来。

应用穷举时对问题所涉及的有限种情形必须一一列举，既不能重复，也不能遗漏。

重复列举直接引发增解，影响解的准确性；而列举的遗漏可能导致问题解的遗漏。

（2）答案需要满足的条件：分析出来的这些情况，需要满足什么条件，才成为问题的答案。把这些条件描述出来。

只要把这两个方面分析好了，问题自然会迎刃而解。

穷举通常应用循环结构来实现。

在循环体中，根据所求解的具体条件，应用选择结构实施判断筛选，求得所要求的解。

## 程序结构

穷举法的程序框架一般为：

```
cnt=0;                                   // 解的个数初值为0

for(k=<区间下限>；k<=<区间上限>；k++)          // 根据指定范围实施穷举 

   if (<约束条件>)                         // 根据约束条件实施筛选 

   { 

      cout<<(<满足要求的解>);              // 输出满足要求的解 

      cnt++;                            // 统计解的个数 

   }
```

# 硬币方案

有50枚硬币，可能包括4种类型：1元、5角、1角和5分。

已知50枚硬币的总价值为20元，求各种硬币的数量。

例如：2、34、6、8就是一种方案。而2、33、15、0是另一个可能的方案，显然方案不唯一。

编写程序求出类似这样的不同的方案一共有多少种？

## 编程思路。

直接对四种类型的硬币的个数进行穷举。其中，1元最多20枚、5角最多40枚、1角最多50枚、5分最多50枚。

另外，如果以元为单位，则5角、1角、5分会化成浮点型数据，容易计算出错。可以将1元、5角、1角、5分变成100分、50分、10分和5分，从而全部采用整型数据处理。

## 源程序及运行结果

```cpp
#include <iostream>         

using namespace std;

int main()                           

{

    int a,b,c,d,cnt=0; 

    for(a=0;a<=20;a++) 

     for(b=0;b<=40;b++) 

      for(c=0;c<=50;c++) 

       for(d=0;d<=50;d++) 

          { 

          if(a*100+b*50+c*10+d*5==2000 && a+b+c+d==50) 

                { 

             cout<<a<<" , "<<b<<" , "<<c<<" , "<<d<<endl; 

             cnt++; 

                } 

          } 

    cout<<"Count="<<cnt<<endl; 

    return 0; 

}
```

# 弱口令爆破

## 场景

弱口令是用户经常犯的一种错误。

我们要避免密码出现在弱口令列表中，也可以推出验证码等增加重试的代价，比如错误 5 次直接冻结账户。

## 弱口令

```
123456
password
12345678
qwerty
123456789
12345
1234
111111
1234567
dragon
123123
baseball
abc123
football
monkey
letmein
696969
shadow
master
666666
qwertyuiop
123321
mustang
1234567890
michael
654321
pussy
superman
1qaz2wsx
7777777
fuckyou
121212
000000
qazwsx
123qwe
killer
trustno1
jordan
jennifer
zxcvbnm
asdfgh
hunter
buster
soccer
harley
batman
andrew
tigger
sunshine
iloveyou
fuckme
2000
charlie
robert
thomas
hockey
ranger
daniel
starwars
klaster
112233
george
asshole
computer
michelle
jessica
pepper
1111
zxcvbn
555555
11111111
131313
freedom
777777
pass
fuck
maggie
159753
aaaaaa
ginger
princess
joshua
cheese
amanda
summer
love
ashley
6969
nicole
chelsea
biteme
matthew
access
yankees
987654321
dallas
austin
thunder
taylor
matrix
william
corvette
hello
martin
heather
secret
fucker
merlin
diamond
1234qwer
gfhjkm
hammer
silver
222222
88888888
anthony
justin
test
bailey
q1w2e3r4t5
patrick
internet
scooter
orange
11111
golfer
cookie
richard
samantha
bigdog
guitar
jackson
whatever
mickey
chicken
sparky
snoopy
maverick
phoenix
camaro
sexy
peanut
morgan
welcome
falcon
cowboy
ferrari
samsung
andrea
smokey
steelers
joseph
mercedes
dakota
arsenal
eagles
melissa
boomer
booboo
spider
nascar
monster
tigers
yellow
xxxxxx
123123123
gateway
marina
diablo
bulldog
qwer1234
compaq
purple
hardcore
banana
junior
hannah
123654
porsche
lakers
iceman
money
cowboys
987654
london
tennis
999999
ncc1701
coffee
scooby
0000
miller
boston
q1w2e3r4
fuckoff
brandon
yamaha
chester
mother
forever
johnny
edward
333333
oliver
redsox
player
nikita
knight
fender
barney
midnight
please
brandy
chicago
badboy
iwantu
slayer
rangers
charles
angel
flower
bigdaddy
rabbit
wizard
bigdick
jasper
enter
rachel
chris
steven
winner
adidas
victoria
natasha
1q2w3e4r
jasmine
winter
prince
panties
marine
ghbdtn
fishing
cocacola
casper
james
232323
raiders
888888
marlboro
gandalf
asdfasdf
crystal
87654321
12344321
sexsex
golden
blowme
bigtits
8675309
panther
lauren
angela
bitch
spanky
thx1138
angels
madison
winston
shannon
mike
toyota
blowjob
jordan23
canada
sophie
Password
apples
dick
tiger
razz
123abc
pokemon
qazxsw
55555
qwaszx
muffin
johnson
murphy
cooper
jonathan
liverpoo
david
danielle
159357
jackie
1990
123456a
789456
turtle
horny
abcd1234
scorpion
qazwsxedc
101010
butter
carlos
password1
dennis
slipknot
qwerty123
booger
asdf
1991
black
startrek
12341234
cameron
newyork
rainbow
nathan
john
1992
rocket
viking
redskins
butthead
asdfghjkl
1212
sierra
peaches
gemini
doctor
wilson
sandra
helpme
qwertyui
victor
florida
dolphin
pookie
captain
tucker
blue
liverpool
theman
bandit
dolphins
maddog
packers
jaguar
lovers
nicholas
united
tiffany
maxwell
zzzzzz
nirvana
jeremy
suckit
stupid
porn
monica
elephant
giants
jackass
hotdog
rosebud
success
debbie
mountain
444444
xxxxxxxx
warrior
1q2w3e4r5t
q1w2e3
123456q
albert
metallic
lucky
azerty
7777
shithead
alex
bond007
alexis
1111111
samson
5150
willie
scorpio
bonnie
gators
benjamin
voodoo
driver
dexter
2112
jason
calvin
freddy
212121
creative
12345a
sydney
rush2112
1989
asdfghjk
red123
bubba
4815162342
passw0rd
trouble
gunner
happy
fucking
gordon
legend
jessie
stella
qwert
eminem
arthur
apple
nissan
bullshit
bear
america
1qazxsw2
nothing
parker
4444
rebecca
qweqwe
garfield
01012011
beavis
69696969
jack
asdasd
december
2222
102030
252525
11223344
magic
apollo
skippy
315475
girls
kitten
golf
copper
braves
shelby
godzilla
beaver
fred
tomcat
august
buddy
airborne
1993
1988
lifehack
qqqqqq
brooklyn
animal
platinum
phantom
online
xavier
darkness
blink182
power
fish
green
789456123
voyager
police
travis
12qwaszx
heaven
snowball
lover
abcdef
00000
pakistan
007007
walter
playboy
blazer
cricket
sniper
hooters
donkey
willow
loveme
saturn
therock
redwings
bigboy
pumpkin
trinity
williams
tits
nintendo
digital
destiny
topgun
runner
marvin
guinness
chance
bubbles
testing
fire
november
minecraft
asdf1234
lasvegas
sergey
broncos
cartman
private
celtic
birdie
little
cassie
babygirl
donald
beatles
1313
dickhead
family
12121212
school
louise
gabriel
eclipse
fluffy
147258369
lol123
explorer
beer
nelson
flyers
spencer
scott
lovely
gibson
doggie
cherry
andrey
snickers
buffalo
pantera
metallica
member
carter
qwertyu
peter
alexande
steve
bronco
paradise
goober
5555
samuel
montana
mexico
dreams
michigan
cock
carolina
yankee
friends
magnum
surfer
poopoo
maximus
genius
cool
vampire
lacrosse
asd123
aaaa
christin
kimberly
speedy
sharon
carmen
111222
kristina
sammy
racing
ou812
sabrina
horses
0987654321
qwerty1
pimpin
baby
stalker
enigma
147147
star
poohbear
boobies
147258
simple
bollocks
12345q
marcus
brian
1987
qweasdzxc
drowssap
hahaha
caroline
barbara
dave
viper
drummer
action
einstein
bitches
genesis
hello1
scotty
friend
forest
010203
hotrod
google
vanessa
spitfire
badger
maryjane
friday
alaska
1232323q
tester
jester
jake
champion
billy
147852
rock
hawaii
badass
chevy
420420
walker
stephen
eagle1
bill
1986
october
gregory
svetlana
pamela
1984
music
shorty
westside
stanley
diesel
courtney
242424
kevin
porno
hitman
boobs
mark
12345qwert
reddog
frank
qwe123
popcorn
patricia
aaaaaaaa
1969
teresa
mozart
buddha
anderson
paul
melanie
abcdefg
security
lucky1
lizard
denise
3333
a12345
123789
ruslan
stargate
simpsons
scarface
eagle
123456789a
thumper
olivia
naruto
1234554321
general
cherokee
a123456
vincent
Usuckballz1
spooky
qweasd
cumshot
free
frankie
douglas
death
1980
loveyou
kitty
kelly
veronica
suzuki
semperfi
penguin
mercury
liberty
spirit
scotland
natalie
marley
vikings
system
sucker
king
allison
marshall
1979
098765
qwerty12
hummer
adrian
1985
vfhbyf
sandman
rocky
leslie
antonio
98765432
4321
softball
passion
mnbvcxz
bastard
passport
horney
rascal
howard
franklin
bigred
assman
alexander
homer
redrum
jupiter
claudia
55555555
141414
zaq12wsx
shit
patches
nigger
cunt
raider
infinity
andre
54321
galore
college
russia
kawasaki
bishop
77777777
vladimir
money1
freeuser
wildcats
francis
disney
budlight
brittany
1994
00000000
sweet
oksana
honda
domino
bulldogs
brutus
swordfis
norman
monday
jimmy
ironman
ford
fantasy
9999
7654321
PASSWORD
hentai
duncan
cougar
1977
jeffrey
house
dancer
brooke
timothy
super
marines
justice
digger
connor
patriots
karina
202020
molly
everton
tinker
alicia
rasdzv3
poop
pearljam
stinky
naughty
colorado
123123a
water
test123
ncc1701d
motorola
ireland
asdfg
slut
matt
houston
boogie
zombie
accord
vision
bradley
reggie
kermit
froggy
ducati
avalon
6666
9379992
sarah
saints
logitech
chopper
852456
simpson
madonna
juventus
claire
159951
zachary
yfnfif
wolverin
warcraft
hello123
extreme
penis
peekaboo
fireman
eugene
brenda
123654789
russell
panthers
georgia
smith
skyline
jesus
elizabet
spiderma
smooth
pirate
empire
bullet
8888
virginia
valentin
psycho
predator
arizona
134679
mitchell
alyssa
vegeta
titanic
christ
goblue
fylhtq
wolf
mmmmmm
kirill
indian
hiphop
baxter
awesome
people
danger
roland
mookie
741852963
1111111111
dreamer
bambam
arnold
1981
skipper
serega
rolltide
elvis
changeme
simon
1q2w3e
lovelove
fktrcfylh
denver
tommy
mine
loverboy
hobbes
happy1
alison
nemesis
chevelle
cardinal
burton
wanker
picard
151515
tweety
michael1
147852369
12312
xxxx
windows
turkey
456789
1974
vfrcbv
sublime
1975
galina
bobby
newport
manutd
daddy
american
alexandr
1966
victory
rooster
qqq111
madmax
electric
bigcock
a1b2c3
wolfpack
spring
phpbb
lalala
suckme
spiderman
eric
darkside
classic
raptor
123456789q
hendrix
1982
wombat
avatar
alpha
zxc123
crazy
hard
england
brazil
1978
01011980
wildcat
polina
freepass
```

# 参考资料

[穷举法的基本思想](https://www.cnblogs.com/cs-whut/archive/2019/06/13/11015258.html)

[算法设计常用思想之穷举法](https://www.cnblogs.com/orxx/p/10947129.html)

* any list
{:toc}