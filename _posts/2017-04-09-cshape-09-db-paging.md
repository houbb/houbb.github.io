---
layout: post
title: Paging
date:  2017-04-09 21:44:46 +0800
categories: [C#]
tags: [cshape, cshape, lang, .net, dotnet]
published: true
---



# 简单需求

实现分页。而且当分页数量较大时，最多只显示自定义的页数。（比如只显示10页）

# Paging

> BaseDto.cs

```c#
/// <summary>
/// base request
/// </summary>
[Serializable]
public abstract class BaseDto
{
    //tostring();
    public static string ToString(ArrayList arrayList)
    {
        int count = arrayList.Count;
        if (count == 0)
        {
            return "[]";
        }

        StringBuilder stringBuilder = new StringBuilder();
        stringBuilder.Append("[");
        foreach (object obj in arrayList)
        {
            stringBuilder.Append(obj).Append(",").Append(" ");
        }

        //Remove the last , append;
        stringBuilder.Remove(stringBuilder.Length-2, 2);
        stringBuilder.Append("]");

        return stringBuilder.ToString();
    }    	
}

```

> BaseRequest.cs

```c#
/// <summary>
/// Pageable request.
/// </summary>
public class PageableRequest : BaseDto
{
    /// <summary>
    /// The page number.
    /// </summary>
    private int pageNum;

    /// <summary>
    /// The size of the page.
    /// </summary>
    private int pageSize = 10;

    /// <summary>
    /// The order by.
    /// </summary>
    private String orderBy;

    public int PageNum
    {
        get
        {
            return pageNum;
        }

        set
        {
            pageNum = value;
        }
    }

    public int PageSize
    {
        get
        {
            return pageSize;
        }

        set
        {
            pageSize = value;
        }
    }

    public string OrderBy
    {
        get
        {
            return orderBy;
        }

        set
        {
            orderBy = value;
        }
    }
}
```

> BaseResponse.cs

```c#
public class BaseResponse : BaseDto
{
    /// <summary>
    /// The resp code.
    /// </summary>
    private String respCode;

    /// <summary>
    /// The message.
    /// </summary>
    private String msg;

    public string RespCode
    {
        get
        {
            return respCode;
        }

        set
        {
            respCode = value;
        }
    }

    public string Msg
    {
        get
        {
            return msg;
        }

        set
        {
            msg = value;
        }
    }
}
```

> PageableResponse.cs

```c#
/**
	 * <p/>
	 * 新增分页的多项属性，主要参考:http://bbs.csdn.net/topics/360010907
	 *
	 * @author liuzh/abel533/isea533
	 * @version 3.3.0
	 * @since 3.2.2
	 * 项目地址 : http://git.oschina.net/free/Mybatis_PageHelper
	 */
	public class PageableResponse<T> : BaseResponse
	{
		#region base fields
		
		//当前页
		private int pageNum;
		//每页的数量
		private int pageSize;
		//当前页的数量
		private int size;

		//由于startRow和endRow不常用，这里说个具体的用法
		//可以在页面中"显示startRow到endRow 共size条数据"

		//当前页面第一个元素在数据库中的行号
		private int startRow;
		//当前页面最后一个元素在数据库中的行号
		private int endRow;
		//总记录数
		private long total;
		//总页数
		private int pages;
		//结果集
		private List<T> list;

		//前一页
		private int prePage;
		//下一页
		private int nextPage;

		//是否为第一页
		private bool isFirstPage = false;
		//是否为最后一页
		private bool isLastPage = false;
		//是否有前一页
		private bool hasPreviousPage = false;
		//是否有下一页
		private bool hasNextPage = false;
		//导航页码数
		private int navigatePages;
		//所有导航页号
		private int[] navigatepageNums;
		//导航条上的第一页
		private int navigateFirstPage;
		//导航条上的最后一页
		private int navigateLastPage;
		#endregion


		#region
		public int PageNum
		{
			get
			{
				return pageNum;
			}
		}

		public int PageSize
		{
			get
			{
				return pageSize;
			}
		}

		public int Size
		{
			get
			{
				return size;
			}
		}

		public int StartRow
		{
			get
			{
				return startRow;
			}
		}

		public int EndRow
		{
			get
			{
				return endRow;
			}
		}

		public long Total
		{
			get
			{
				return total;
			}
		}

		public int Pages
		{
			get
			{
				return pages;
			}
		}

		public List<T> List
		{
			get
			{
				return list;
			}
		}

		public int PrePage
		{
			get
			{
				return prePage;
			}
		}

		public int NextPage
		{
			get
			{
				return nextPage;
			}
		}

		public bool IsFirstPage
		{
			get
			{
				return isFirstPage;
			}
		}

		public bool IsLastPage
		{
			get
			{
				return isLastPage;
			}
		}

		public bool HasPreviousPage
		{
			get
			{
				return hasPreviousPage;
			}
		}

		public bool HasNextPage
		{
			get
			{
				return hasNextPage;
			}
		}

		public int NavigatePages
		{
			get
			{
				return navigatePages;
			}
		}

		public int[] NavigatepageNums
		{
			get
			{
				return navigatepageNums;
			}
		}

		public int NavigateFirstPage
		{
			get
			{
				return navigateFirstPage;
			}
		}

		public int NavigateLastPage
		{
			get
			{
				return navigateLastPage;
			}
		}
		#endregion

		PageableResponse(List<T> list, int navigatePages)
		{
			int count = list.Count;
			if (list is ICollection)
			{
				this.pageNum = 1;
				this.pageSize = count;

				this.pages = 1;
				this.list = list;
				this.size = count;
				this.total = count;
				this.startRow = 0;
				this.endRow = count > 0 ? count - 1 : 0;
			}

			if (list is ICollection)
			{
				this.navigatePages = navigatePages;
				//计算导航页
				calcNavigatepageNums();
				//计算前后页，第一页，最后一页
				calcPage();
				//判断页面边界
				judgePageBoudary();
			}
		}

		public PageableResponse(List<T> list) : this(list, 8)
		{
		}


		/**
     * 计算导航页
     */
		private void calcNavigatepageNums()
		{
			//当总页数小于或等于导航页码数时
			if (pages <= navigatePages)
			{
				navigatepageNums = new int[pages];
				for (int i = 0; i < pages; i++)
				{
					navigatepageNums[i] = i + 1;
				}
			}
			else { //当总页数大于导航页码数时
				navigatepageNums = new int[navigatePages];
				int startNum = pageNum - navigatePages / 2;
				int endNum = pageNum + navigatePages / 2;

				if (startNum < 1)
				{
					startNum = 1;
					//(最前navigatePages页
					for (int i = 0; i < navigatePages; i++)
					{
						navigatepageNums[i] = startNum++;
					}
				}
				else if (endNum > pages)
				{
					endNum = pages;
					//最后navigatePages页
					for (int i = navigatePages - 1; i >= 0; i--)
					{
						navigatepageNums[i] = endNum--;
					}
				}
				else {
					//所有中间页
					for (int i = 0; i < navigatePages; i++)
					{
						navigatepageNums[i] = startNum++;
					}
				}
			}
		}


		/**
		 * 计算前后页，第一页，最后一页
		 */
		private void calcPage()
		{
			if (navigatepageNums != null && navigatepageNums.Length > 0)
			{
				navigateFirstPage = navigatepageNums[0];
				navigateLastPage = navigatepageNums[navigatepageNums.Length - 1];
				if (pageNum > 1)
				{
					prePage = pageNum - 1;
				}
				if (pageNum < pages)
				{
					nextPage = pageNum + 1;
				}
			}
		}

		/**
		 * 判定页面边界
		 */
		private void judgePageBoudary()
		{
			isFirstPage = pageNum == 1;
			isLastPage = pageNum == pages;
			hasPreviousPage = pageNum > 1;
			hasNextPage = pageNum < pages;
		}

		public override string ToString()
		{
			return string.Format("[PageableResponse: pageNum={0}, pageSize={1}, size={2}, startRow={3}, endRow={4}, total={5}, pages={6}, list={7}, prePage={8}, nextPage={9}, isFirstPage={10}, isLastPage={11}, hasPreviousPage={12}, hasNextPage={13}, navigatePages={14}, navigatepageNums={15}, navigateFirstPage={16}, navigateLastPage={17}, PageNum={18}, PageSize={19}, Size={20}, StartRow={21}, EndRow={22}, Total={23}, Pages={24}, List={25}, PrePage={26}, NextPage={27}, IsFirstPage={28}, IsLastPage={29}, HasPreviousPage={30}, HasNextPage={31}, NavigatePages={32}, NavigatepageNums={33}, NavigateFirstPage={34}, NavigateLastPage={35}]", pageNum, pageSize, size, startRow, endRow, total, pages, list, prePage, nextPage, isFirstPage, isLastPage, hasPreviousPage, hasNextPage, navigatePages, navigatepageNums, navigateFirstPage, navigateLastPage, PageNum, PageSize, Size, StartRow, EndRow, Total, Pages, List, PrePage, NextPage, IsFirstPage, IsLastPage, HasPreviousPage, HasNextPage, NavigatePages, NavigatepageNums, NavigateFirstPage, NavigateLastPage);
		}

	}
```


# 简单测试

- ExeTest.cs

```c#
class ExeTest
{
    static void Main(string[] args)
    {
        Console.Write("");
        System.Collections.Generic.List<string> stringList = new System.Collections.Generic.List<string>();
        stringList.Add("One");
        stringList.Add("two");

        PageableResponse<string> response = new PageableResponse<string>(stringList);

        Console.WriteLine("response : {0}", response);
    }
}
```

- result

```
response : [PageableResponse: pageNum=1, pageSize=2, size=2, startRow=0, endRow=1, total=2, pages=1, list=System.Collections.Generic.List`1[System.String], prePage=0, nextPage=0, isFirstPage=True, isLastPage=True, hasPreviousPage=False, hasNextPage=False, navigatePages=8, navigatepageNums=System.Int32[], navigateFirstPage=1, navigateLastPage=1, PageNum=1, PageSize=2, Size=2, StartRow=0, EndRow=1, Total=2, Pages=1, List=System.Collections.Generic.List`1[System.String], PrePage=0, NextPage=0, IsFirstPage=True, IsLastPage=True, HasPreviousPage=False, HasNextPage=False, NavigatePages=8, NavigatepageNums=System.Int32[], NavigateFirstPage=1, NavigateLastPage=1]
```


备注：

1、在C#中Collection和Array无法直接打印出内容。需要特殊处理。为此将在 ```BaseDto.cs``` 中添加反射 ```ToString()```，并处理此特殊情况。

2、PageSize 在查询记录如果少于分页大小时是错误的。实际应用中，PageSize是前端传过来的。不需要后台再次反馈回去。


* any list
{:toc}









