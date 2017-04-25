---
title: '自此使用Object字面量取代switch'
date: 2016-03-25 21:23:45
tag: ionic2
thumbnail: 'angular_logo.png'
keywords: Object, 对象, switch...case, 条件判断
excerpt: 几乎在所有主流编程语言中switch...case语句都占有一席之地，并且几乎所有介绍条件表达式的资料中都指示说当多条件判断时使用switch...case语句比if...else if...更具效率。在JavaScript中也不例外，switch...case语句在处理多条件判断时仍然很锋利，不过使用Object字面量完全可以取代它...
---

几乎在所有主流编程语言中switch...case语句都占有一席之地，并且几乎所有介绍条件表达式的资料中都指示说当多条件判断时使用switch...case语句比if...else if...更具效率。在JavaScript中也不例外，switch...case语句在处理多条件判断时仍然很锋利，不过使用**Object字面量**完全可以取代它...

## switch...case的问题

初始在JavaScript中遇到switch...case时，首先容易出错的地方是其比较的全等性，即在case语句判断中使用的是**===**运算，所以下面的代码不能达到想要的结果：

~~~ javascript
var count = '0';
switch(count) {
  case 0:
    handleZero();  // 不会被执行，因为0 !== '0'
    break;
  case 1:
    handleOne();
    break;
  default:
    break;
}
~~~

上述代码中想要处理count为0时的情况，而由于case语句中判断相等时使用的是全等操作，导致`handleZero()`不会被调用。

另外，swtich...case语句的长相也和JavaScript其他部分格格不入：其case语句中不使用花括号建立代码块，而且还需要在每个case语句后手动加上break语句（有些情况可能多个case语句共用一个break）。

再另外，case中的判断是逐条进行的，也就意味着当判断条件增多时，查找对应匹配的条件可能会更费时。所以在介绍switch...case语句时，很多资料会提醒读者：对各case条件的顺序要做到心中有数，将最可能匹配到的case语句放到最前面可以提高效率。

上述这些都是使用switch...case时容易出错的地方，好在JavaScript中有神器**Object字面量**可供使用，**Object字面量**在JavaScript中的使用率极高，因为其使用起来很灵活，在属性查找方面更是拥有良好的体验，完全可以取代switch...case语句。

## **Object字面量**查找

在编写JavaScript代码时，我们几乎随时都在和Object打交道，不论是通过构造函数的形式还是其字面量的形式，我们在对其进行属性查找都极为方便，让我们使用**Object字面量**实现一个简单的功能：

~~~ javascript
function getGender(gender) {
  var genderMap = {
    '0': 'female',
    '1': 'male',
    'default': 'other'
  }
  return genderMap[gender] || genderMap['default'];
}

var gender = getGender('0');  // 'female'
~~~

甚至还可以再进行精简：

~~~ javascript
function getGender(gender) {
  return {
    '0': 'female',
    '1': 'male'
  }[gender] || 'other';
}
var gender = getGender('0');  // 'female'
~~~


而此功能若使用switch...case完成则需要如下代码：

~~~ javascript
function getGender(gender) {
  var result = '';
  switch(gender) {
    case '0':
      result = 'female';
      break;
    case '1':
      result = 'male';
      break;
    default:
      result = 'other';
      break;
  }
  return result;
}
var gender = getGender('0');  // 'female'
~~~

可以明显看到，使用**Object字面量**的代码可读性和可维护性更优。

我们甚至还可以进行更加灵(zhuang)活(bi)的变换：

~~~ javascript
function getGender(gender) {
  var genderMap = {
    '0': function() {
      return 'female';
    },
    '1': function() {
      return 'male';
    }
  }
  return genderMap[gender]();
}
var gender = getGender('0');  // 'female'
~~~

但是稍等，总感觉好像少了点啥。没有考虑到默认情况，我们来修复此问题：

~~~ javascript
function getGender(gender) {
  var genderMap = {
    '0': function() {
      return 'female';
    },
    '1': function() {
      return 'male';
    },
    'default': function() {
      return 'other';
    }
  }
  return genderMap[gender] ? genderMap[gender]() || genderMap['default']();
}
var gender = getGender('0');  // 'female'
~~~

很简单吧，只需要简单的判断`genderMap[gender]`是否存在，如果不存在则使用`genderMap['default']()`取其默认值。

## 多条件共用业务逻辑

上文中提到，某些情况下多个case语句可以共用同一个`break`：

~~~ javascript
function get(gender) {
  var result = '';
  switch(gender) {
    case '1':
    case '3':
      result = 'female';
      break;
    case '2':
    case '4':
      result = 'male';
      break;
    default:
      result = 'other';
      break;
  }
  return result;
}
var gender = getGender('0');  // 'female'
~~~

也就是对于某些输入，进行相同的操作，而这种清空在**Object字面量**中又如何处理呢：

~~~ javascript
function getGender(gender) {
  function isFemale() {
    return 'female';
  }
  function isMale() {
    return 'male'
  }
  function isDefault() {
    return 'other';
  }
  var genderMap = {
    '1': isFemale,
    '3': isFemale,
    '2': isMale,
    '4': isMale,
    'default': isDefault
  };
  return genderMap[gender] ? genderMap[gender]() || genderMap['default']();
}
var gender = getGender('0');  // 'female'
~~~

简单易读，而且少了switch...case繁琐的语句形式，也降低了代码出错的可能性。

## 总结

switch...case作为条件判断的老牌主力，繁琐的句式、排错困难等缺点使得其在很多情况下已经不能达到我们的期望了，而反观Object的灵活性、易用性，我们有何理由不使用呢？更由于JavaScript作为弱类型语言，**Object字面量**中不仅仅能够像上文中返回字符串或者函数，在其中可以做任何操作。