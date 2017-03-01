---
title: '理解Ionic 2之import'
date: 2016-02-21 19:23:45
tag: ionic2
keywords: Cordova, Ionic CLI, import, Ionic 2基础, Ionic 2 basement, ES6, TypeScript, 模块化, export
excerpt: 在Ionic 1中最重要的概念是模块化，由于Angular 1实现的Ionic 1理所当然地继承了模块化的概念。所以我们通过Ionic 1可以非常优雅地按照模块化的理念构建我们的工程，使得维护、重构、增删功能节点、理解工程不再困难晦涩。当然，Ionic 2作为Ionic 1的升级版本，在模块化上更加简洁、更加强大。。。
---
[es6-modules]: http://exploringjs.com/es6/ch_modules.html
[ts-modules]: https://www.typescriptlang.org/docs/handbook/modules.html
[ts-docs]: https://www.typescriptlang.org/docs/tutorial.html
[es6-docs]: http://exploringjs.com/es6/
在Ionic 1中最重要的概念是模块化，由于Angular 1实现的Ionic 1理所当然地继承了模块化的概念。所以我们通过Ionic 1可以非常优雅地按照模块化的理念构建我们的工程，使得维护、重构、增删功能节点、理解工程不再困难晦涩。当然，Ionic 2作为Ionic 1的升级版本，在模块化的实现上要更加简洁、更加强大。本文通过ES6的关键字**import**来接触Ionic 2/Angular 2的模块化。

 > 注：本文可能涉及到[ES6][es6-docs]或[TypeScript][ts-docs]的相关知识。

## 模块化

JavaScript中模块化的概念由来已久，不过一直没有作为JavaScript的内置功能而存在，基本都是通过库的形式才能使用。而ES6的出现打破了这个局面，当然TypeScript作为升级版本当然也支持模块化。而使用Ionic 2开发应用时需要使用ES6或TypeScript，这就为Ionic 2的模块化之路奠定了基础。

## import语法

**import**是ES6中的关键字，使用它可以引入其他模块，其基本语法如下：

~~~ javascript
import {SomeClass} from 'path/to/SomeClass';
~~~

其中SomeClass是其他模块的类名，而'path/to/SomeClass'其实表示的是'path/to/SomeClass.js'或'path/to/SomeClass.ts'（使用TypeScript时），后缀名可以省略，在SomeClass.js/SomeClass.ts文件中导出了一个名为SomeClass的类。**注意，导出的类名不要求和类所在文件的文件名相同**。

## 案例分析

如果我们的工程结构如下：

~~~ javascript
src/
    app/
        app.ts
        app.html
    components/
        dropdown/
        	dropdown.ts
        	dropdown.html
        ...
    ...
~~~

现在我们如果想要在app.ts中使用我们的dropdwon组件应该这样做：

~~~ javascript
// app.ts

// 获取dropdown.ts里面导出的类
import {DropDownComponent} from '../components/dropdown/dropdown';

// 根据dropdown组件的实现方式合理使用
~~~

 > 注意，导入时的路径相对于当前文件所在的文件夹。

## import之类别名

在实际开发中，开发者都有自己定义变量名、文件名的习惯，而有时为了代码的可维护性不得不将变量名、文件名等设置为有意义的值，达到所见即所得的目的。如此一来，文件名或变量名可能就会比较长，当然项目上线前肯定会有压缩的过程，故不必在意对文件大小的影响。不过在编码时长变量名总归不太方便，就像上例中的DropDownComponent使用起来就很不方便。还有一种情形，团队开发中总有那么几个“黑洞”，不按照规范定义变量名，当别人引入TA的模块时可能不知道是什么意思。为了解决这些问题，**import**在引入类时，可以为类起一个别名，从而方便使用：

~~~ javascript
import {DropDownComponent as DropDownComp} from '../components/dropdown/dropdown';	// 此后可使用DropDownComp替代DropDownComponent
import {Bala as LoginService} from '../providers/bala/Bala';	// 此后可使用LoginService替代Bala，从而不会使开发者困惑
~~~

## import之导入多个类

从一个文件中导入多个类很简单，只需要将类名用逗号隔开即可：

~~~ javascript
import {Login, LogOut, Register} from './userService';
~~~

如果需要导入一个文件中全部的类时，可以使用通配符\*来表示：

~~~ javascript
import * from './userService';
~~~

## import的前提 -- export

上面我们只讲述了如何使用**import**，可实际上我们并不能随便将其他文件中定义的类引入到我们当前的文件中，能够引入的必须是他人允许我们引入的，就像即使商家生产了蛋糕，如果不放在橱窗里，我们也完全不知道蛋糕的存在。而**export**的功能就是将“蛋糕”放在橱窗里：

~~~ javascript
// dropdown.ts

export class DropDownComponent {
	// DropDownComponent的具体实现
}
~~~

## export和import的延伸

其实**export**和**import**的作用并不像上文描述地那么单一，他们不仅仅可以对类起作用，变量、方法、类等等等等都可以被它们操作，只是要注意它们之间的关系：**import是因export而生的**。

> 参考文档：<br>
> [ES6 import和export][es6-modules]<br>
> [TypeScript import和export][ts-modules]<br>