#!/usr/bin/env python3
"""
将指定目录及其子目录中的所有 Excel（.xlsx）文件转换为 Markdown 格式的文件。

此脚本会遍历给定目录下的所有文件夹，找到后缀为 `.xlsx` 的文件，
然后使用 pandas 读取每个工作表，并将其内容导出为 Markdown 表格。
每个工作表都会被保存为一个独立的 `.md` 文件，文件名由原始
Excel 文件名和工作表名称组成。例如，如果原文件是 `report.xlsx`，
工作表名是 `Sheet1`，那么生成的 Markdown 文件名将是
`report_Sheet1.md`，并且会保存在与原文件同一目录下。

使用方法：
    python convert_xlsx_to_md.py [directory]

如果没有指定目录，脚本默认使用当前工作目录。
"""

import os
import sys
from typing import Optional

import pandas as pd


def dataframe_to_markdown(df: pd.DataFrame) -> str:
    """将 pandas DataFrame 转换为 Markdown 表格字符串。

    由于 pandas 的 `to_markdown` 方法需要额外的 `tabulate` 依赖，
    这里手动构建 Markdown 表格格式。这种格式在 GitHub 等平台
    上可以正常渲染。

    Args:
        df: 要转换的 DataFrame。

    Returns:
        包含 Markdown 表格的多行字符串。
    """
    if df.empty:
        return "(空表)"

    # 构建表头
    header_cells = [str(col) for col in df.columns]
    header_row = "| " + " | ".join(header_cells) + " |"
    # 构建分隔行，使用三个连字符表示列分隔
    delimiter_row = "| " + " | ".join(["---"] * len(df.columns)) + " |"
    # 构建数据行
    data_rows = []
    for _, row in df.iterrows():
        cell_values = []
        for value in row:
            # 将 NaN 转为空串，否则转为字符串
            if pd.isna(value):
                cell_values.append("")
            else:
                cell_values.append(str(value))
        data_rows.append("| " + " | ".join(cell_values) + " |")
    return "\n".join([header_row, delimiter_row] + data_rows)


def convert_xlsx_to_markdown(directory: str) -> None:
    """遍历目录，将其中的所有 .xlsx 文件转换为 Markdown 文件。

    Args:
        directory: 需要遍历的根目录路径。
    """
    # 通过 os.walk 递归遍历目录及其子目录
    for root, _, files in os.walk(directory):
        for filename in files:
            # 仅处理后缀为 .xlsx 的文件（忽略大小写）
            if filename.lower().endswith(".xlsx"):
                xlsx_path = os.path.join(root, filename)
                try:
                    excel = pd.ExcelFile(xlsx_path)
                except Exception as exc:
                    print(f"无法读取 Excel 文件：{xlsx_path}，错误：{exc}")
                    continue

                base_name, _ = os.path.splitext(filename)
                # 遍历每个工作表
                for sheet_name in excel.sheet_names:
                    try:
                        df = pd.read_excel(excel, sheet_name=sheet_name)
                    except Exception as exc:
                        print(
                            f"读取工作表 '{sheet_name}' 时出错，文件：{xlsx_path}，错误：{exc}"
                        )
                        continue

                    # 将 DataFrame 转换为 Markdown 格式
                    # 将 DataFrame 转换为 Markdown 表格
                    try:
                        md_table = dataframe_to_markdown(df)
                    except Exception as exc:
                        print(
                            f"转换工作表 '{sheet_name}' 为 Markdown 时出错，文件：{xlsx_path}，错误：{exc}"
                        )
                        continue

                    # 构造输出文件名，替换工作表名中的特殊字符以避免非法文件名
                    safe_sheet_name = (
                        sheet_name
                        .replace(" ", "_")
                        .replace("/", "_")
                        .replace("\\", "_")
                        .replace(":", "_")
                        .replace("*", "_")
                        .replace("?", "_")
                        .replace("\"", "_")
                        .replace("<", "_")
                        .replace(">", "_")
                        .replace("|", "_")
                    )
                    output_filename = f"{base_name}_{safe_sheet_name}.md"
                    output_path = os.path.join(root, output_filename)

                    # 写入 Markdown 内容，包括工作表标题
                    try:
                        with open(output_path, "w", encoding="utf-8") as md_file:
                            md_file.write(f"# {sheet_name}\n\n")
                            md_file.write(md_table)
                            md_file.write("\n")
                        print(f"已生成 Markdown 文件：{output_path}")
                    except Exception as exc:
                        print(
                            f"写入 Markdown 文件 '{output_path}' 时出错，错误：{exc}"
                        )

                # 关闭 ExcelFile 以释放资源
                excel.close()


def main(args: Optional[list[str]] = None) -> None:
    """脚本入口函数。

    Args:
        args: 命令行参数列表。
    """
    if args is None:
        args = sys.argv[1:]
    # 如果提供了目录参数，则使用该目录；否则使用当前目录
    directory = args[0] if args else os.getcwd()
    if not os.path.isdir(directory):
        print(f"指定的目录不存在或不是目录：{directory}")
        sys.exit(1)
    convert_xlsx_to_markdown(directory)


if __name__ == "__main__":
    main()