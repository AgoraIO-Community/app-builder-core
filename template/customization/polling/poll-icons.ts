interface PollIconsInterface {
  mcq: string;
  'like-dislike': string;
  question: string;
  'bar-chart': string;
  anonymous: string;
  'stop-watch': string;
  group: string;
  'co-host': string;
}

const pollIcons: PollIconsInterface = {
  mcq: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgaWQ9InBvbGwtaWNvbnMiPgo8bWFzayBpZD0ibWFzazBfOTYzN182NjY0OCIgc3R5bGU9Im1hc2stdHlwZTphbHBoYSIgbWFza1VuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeD0iMCIgeT0iMCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij4KPHJlY3QgaWQ9IkJvdW5kaW5nIGJveCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRkY0MTREIi8+CjwvbWFzaz4KPGcgbWFzaz0idXJsKCNtYXNrMF85NjM3XzY2NjQ4KSI+CjxwYXRoIGlkPSJjaGVja2xpc3QiIGQ9Ik01LjUyNDggMTYuMTczOUw5LjA3NDggMTIuNjIzOUM5LjI3NDggMTIuNDIzOSA5LjUwODE0IDEyLjMyODEgOS43NzQ4IDEyLjMzNjRDMTAuMDQxNSAxMi4zNDQ4IDEwLjI3NDggMTIuNDQ4OSAxMC40NzQ4IDEyLjY0ODlDMTAuNjU4MSAxMi44NDg5IDEwLjc0OTggMTMuMDgyMyAxMC43NDk4IDEzLjM0ODlDMTAuNzQ5OCAxMy42MTU2IDEwLjY1ODEgMTMuODQ4OSAxMC40NzQ4IDE0LjA0ODlMNi4yNDk4IDE4LjI5ODlDNi4wNDk4IDE4LjQ5ODkgNS44MTY0NyAxOC41OTg5IDUuNTQ5OCAxOC41OTg5QzUuMjgzMTQgMTguNTk4OSA1LjA0OTggMTguNDk4OSA0Ljg0OTggMTguMjk4OUwyLjY5OTggMTYuMTQ4OUMyLjUxNjQ3IDE1Ljk2NTYgMi40MjQ4IDE1LjczMjMgMi40MjQ4IDE1LjQ0ODlDMi40MjQ4IDE1LjE2NTYgMi41MTY0NyAxNC45MzIzIDIuNjk5OCAxNC43NDg5QzIuODgzMTQgMTQuNTY1NiAzLjExNjQ3IDE0LjQ3MzkgMy4zOTk4IDE0LjQ3MzlDMy42ODMxNCAxNC40NzM5IDMuOTE2NDcgMTQuNTY1NiA0LjA5OTggMTQuNzQ4OUw1LjUyNDggMTYuMTczOVpNNS41MjQ4IDguMTczOTRMOS4wNzQ4IDQuNjIzOTRDOS4yNzQ4IDQuNDIzOTQgOS41MDgxNCA0LjMyODEgOS43NzQ4IDQuMzM2NDRDMTAuMDQxNSA0LjM0NDc3IDEwLjI3NDggNC40NDg5NCAxMC40NzQ4IDQuNjQ4OTRDMTAuNjU4MSA0Ljg0ODk0IDEwLjc0OTggNS4wODIyNyAxMC43NDk4IDUuMzQ4OTRDMTAuNzQ5OCA1LjYxNTYgMTAuNjU4MSA1Ljg0ODk0IDEwLjQ3NDggNi4wNDg5NEw2LjI0OTggMTAuMjk4OUM2LjA0OTggMTAuNDk4OSA1LjgxNjQ3IDEwLjU5ODkgNS41NDk4IDEwLjU5ODlDNS4yODMxNCAxMC41OTg5IDUuMDQ5OCAxMC40OTg5IDQuODQ5OCAxMC4yOTg5TDIuNjk5OCA4LjE0ODk0QzIuNTE2NDcgNy45NjU2IDIuNDI0OCA3LjczMjI3IDIuNDI0OCA3LjQ0ODk0QzIuNDI0OCA3LjE2NTYgMi41MTY0NyA2LjkzMjI3IDIuNjk5OCA2Ljc0ODk0QzIuODgzMTQgNi41NjU2IDMuMTE2NDcgNi40NzM5NCAzLjM5OTggNi40NzM5NEMzLjY4MzE0IDYuNDczOTQgMy45MTY0NyA2LjU2NTYgNC4wOTk4IDYuNzQ4OTRMNS41MjQ4IDguMTczOTRaTTEzLjk5OTggMTYuOTk4OUMxMy43MTY1IDE2Ljk5ODkgMTMuNDc5IDE2LjkwMzEgMTMuMjg3MyAxNi43MTE0QzEzLjA5NTYgMTYuNTE5OCAxMi45OTk4IDE2LjI4MjMgMTIuOTk5OCAxNS45OTg5QzEyLjk5OTggMTUuNzE1NiAxMy4wOTU2IDE1LjQ3ODEgMTMuMjg3MyAxNS4yODY0QzEzLjQ3OSAxNS4wOTQ4IDEzLjcxNjUgMTQuOTk4OSAxMy45OTk4IDE0Ljk5ODlIMjAuOTk5OEMyMS4yODMxIDE0Ljk5ODkgMjEuNTIwNiAxNS4wOTQ4IDIxLjcxMjMgMTUuMjg2NEMyMS45MDQgMTUuNDc4MSAyMS45OTk4IDE1LjcxNTYgMjEuOTk5OCAxNS45OTg5QzIxLjk5OTggMTYuMjgyMyAyMS45MDQgMTYuNTE5OCAyMS43MTIzIDE2LjcxMTRDMjEuNTIwNiAxNi45MDMxIDIxLjI4MzEgMTYuOTk4OSAyMC45OTk4IDE2Ljk5ODlIMTMuOTk5OFpNMTMuOTk5OCA4Ljk5ODk0QzEzLjcxNjUgOC45OTg5NCAxMy40NzkgOC45MDMxIDEzLjI4NzMgOC43MTE0NEMxMy4wOTU2IDguNTE5NzcgMTIuOTk5OCA4LjI4MjI3IDEyLjk5OTggNy45OTg5NEMxMi45OTk4IDcuNzE1NiAxMy4wOTU2IDcuNDc4MSAxMy4yODczIDcuMjg2NDRDMTMuNDc5IDcuMDk0NzcgMTMuNzE2NSA2Ljk5ODk0IDEzLjk5OTggNi45OTg5NEgyMC45OTk4QzIxLjI4MzEgNi45OTg5NCAyMS41MjA2IDcuMDk0NzcgMjEuNzEyMyA3LjI4NjQ0QzIxLjkwNCA3LjQ3ODEgMjEuOTk5OCA3LjcxNTYgMjEuOTk5OCA3Ljk5ODk0QzIxLjk5OTggOC4yODIyNyAyMS45MDQgOC41MTk3NyAyMS43MTIzIDguNzExNDRDMjEuNTIwNiA4LjkwMzEgMjEuMjgzMSA4Ljk5ODk0IDIwLjk5OTggOC45OTg5NEgxMy45OTk4WiIgZmlsbD0iI0JEQ0ZEQiIvPgo8L2c+CjwvZz4KPC9zdmc+Cg==',
  'like-dislike':
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgaWQ9InBvbGwtaWNvbnMiPgo8bWFzayBpZD0ibWFzazBfOTYzN181Nzk5NSIgc3R5bGU9Im1hc2stdHlwZTphbHBoYSIgbWFza1VuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeD0iMCIgeT0iMCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij4KPHJlY3QgaWQ9IkJvdW5kaW5nIGJveCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRkY0MTREIi8+CjwvbWFzaz4KPGcgbWFzaz0idXJsKCNtYXNrMF85NjM3XzU3OTk1KSI+CjxwYXRoIGlkPSJ0aHVtYnNfdXBfZG93biIgZD0iTTAuNTg3NSAxMy40MTQxQzAuOTc5MTY3IDEzLjgwNTcgMS40NSAxNC4wMDE2IDIgMTQuMDAxNkg4LjI1QzguNTUgMTQuMDAxNiA4LjgyOTE3IDEzLjkyMjQgOS4wODc1IDEzLjc2NDFDOS4zNDU4MyAxMy42MDU3IDkuNTMzMzMgMTMuMzg0OSA5LjY1IDEzLjEwMTZMMTEuOSA3LjgwMTU2QzExLjkzMzMgNy43MTgyMyAxMS45NTgzIDcuNjMwNzMgMTEuOTc1IDcuNTM5MDZDMTEuOTkxNyA3LjQ0NzQgMTIgNy4zNTE1NiAxMiA3LjI1MTU2VjYuMDAxNTZDMTIgNS43MTgyMyAxMS45MDQyIDUuNDgwNzMgMTEuNzEyNSA1LjI4OTA2QzExLjUyMDggNS4wOTc0IDExLjI4MzMgNS4wMDE1NiAxMSA1LjAwMTU2SDUuOEw3LjEyNSAyLjEyNjU2QzcuMjA4MzMgMS42MDk5IDcuMDkxNjcgMS4xODQ5IDYuNzc1IDAuODUxNTYyQzYuNDU4MzMgMC41MTgyMjkgNi4wODMzMyAwLjM1MTU2MiA1LjY1IDAuMzUxNTYyQzUuNDY2NjcgMC4zNTE1NjIgNS4yODMzMyAwLjM4OTA2MiA1LjEgMC40NjQwNjJDNC45MTY2NyAwLjUzOTA2MiA0Ljc1IDAuNjUxNTYzIDQuNiAwLjgwMTU2M0wwLjQ1IDQuOTUxNTZDMC4zMTY2NjcgNS4wODQ5IDAuMjA4MzMzIDUuMjQzMjMgMC4xMjUgNS40MjY1NkMwLjA0MTY2NjcgNS42MDk5IDAgNS44MDE1NiAwIDYuMDAxNTZWMTIuMDAxNkMwIDEyLjU1MTYgMC4xOTU4MzMgMTMuMDIyNCAwLjU4NzUgMTMuNDE0MVoiIGZpbGw9IiNCRENGREIiLz4KPHBhdGggaWQ9InRodW1ic191cF9kb3duXzIiIGQ9Ik0xMyAxOUMxMi43MTY3IDE5IDEyLjQ3OTIgMTguOTA0MiAxMi4yODc1IDE4LjcxMjVDMTIuMDk1OCAxOC41MjA4IDEyIDE4LjI4MzMgMTIgMThWMTYuNzVDMTIgMTYuNjUgMTIuMDA4MyAxNi41NTQyIDEyLjAyNSAxNi40NjI1QzEyLjA0MTcgMTYuMzcwOCAxMi4wNjY3IDE2LjI4MzMgMTIuMSAxNi4yTDE0LjM1IDEwLjlDMTQuNDgzMyAxMC42MTY3IDE0LjY3NSAxMC4zOTU4IDE0LjkyNSAxMC4yMzc1QzE1LjE3NSAxMC4wNzkyIDE1LjQ1IDEwIDE1Ljc1IDEwSDIyQzIyLjU1IDEwIDIzLjAyMDggMTAuMTk1OCAyMy40MTI1IDEwLjU4NzVDMjMuODA0MiAxMC45NzkyIDI0IDExLjQ1IDI0IDEyVjE4QzI0IDE4LjIgMjMuOTYyNSAxOC4zODc1IDIzLjg4NzUgMTguNTYyNUMyMy44MTI1IDE4LjczNzUgMjMuNyAxOC45IDIzLjU1IDE5LjA1TDE5LjQgMjMuMkMxOS4yNSAyMy4zNSAxOS4wODMzIDIzLjQ2MjUgMTguOSAyMy41Mzc1QzE4LjcxNjcgMjMuNjEyNSAxOC41MzMzIDIzLjY1IDE4LjM1IDIzLjY1QzE3LjkxNjcgMjMuNjUgMTcuNTQxNyAyMy40ODMzIDE3LjIyNSAyMy4xNUMxNi45MDgzIDIyLjgxNjcgMTYuNzkxNyAyMi4zOTE3IDE2Ljg3NSAyMS44NzVMMTguMiAxOUgxM1oiIGZpbGw9IiNCRENGREIiLz4KPC9nPgo8L2c+Cjwvc3ZnPgo=',
  question:
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgaWQ9InBvbGwtaWNvbnMiPgo8bWFzayBpZD0ibWFzazBfOTYzN182NjYzMCIgc3R5bGU9Im1hc2stdHlwZTphbHBoYSIgbWFza1VuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeD0iMCIgeT0iMCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij4KPHJlY3QgaWQ9IkJvdW5kaW5nIGJveCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRkY0MTREIi8+CjwvbWFzaz4KPGcgbWFzaz0idXJsKCNtYXNrMF85NjM3XzY2NjMwKSI+CjxwYXRoIGlkPSJWZWN0b3IiIGQ9Ik02LjI1IDEzLjg3NUgxMy43NVYxMi4zNzVINi4yNVYxMy44NzVaTTYuMjUgMTAuODc1SDE3Ljc1VjkuMzc1SDYuMjVWMTAuODc1Wk02LjI1IDcuODc1SDE3Ljc1VjYuMzc1SDYuMjVWNy44NzVaTTQuMzA3NzUgMTcuNzVDMy44MTA1OCAxNy43NSAzLjM4NSAxNy41NzMgMy4wMzEgMTcuMjE5QzIuNjc3IDE2Ljg2NSAyLjUgMTYuNDM5NCAyLjUgMTUuOTQyM1Y0LjMwNzc1QzIuNSAzLjgxMDU4IDIuNjc3IDMuMzg1IDMuMDMxIDMuMDMxQzMuMzg1IDIuNjc3IDMuODEwNTggMi41IDQuMzA3NzUgMi41SDE5LjY5MjNDMjAuMTg5NCAyLjUgMjAuNjE1IDIuNjc3IDIwLjk2OSAzLjAzMUMyMS4zMjMgMy4zODUgMjEuNSAzLjgxMDU4IDIxLjUgNC4zMDc3NVYxNS45NDIzQzIxLjUgMTYuNDM5NCAyMS4zMjMgMTYuODY1IDIwLjk2OSAxNy4yMTlDMjAuNjE1IDE3LjU3MyAyMC4xODk0IDE3Ljc1IDE5LjY5MjMgMTcuNzVIMTQuNDgyN0wxMi43NDggMjAuMzU1N0MxMi42NTczIDIwLjQ5MjkgMTIuNTQ3NyAyMC41OTU4IDEyLjQxOTIgMjAuNjY0NUMxMi4yOTA5IDIwLjczMyAxMi4xNTEyIDIwLjc2NzMgMTIgMjAuNzY3M0MxMS44NDg4IDIwLjc2NzMgMTEuNzA5MSAyMC43MzMgMTEuNTgwOCAyMC42NjQ1QzExLjQ1MjMgMjAuNTk1OCAxMS4zNDI3IDIwLjQ5MjkgMTEuMjUyIDIwLjM1NTdMOS41MTcyNSAxNy43NUg0LjMwNzc1WiIgZmlsbD0iI0JEQ0ZEQiIvPgo8L2c+CjwvZz4KPC9zdmc+Cg==',
  'bar-chart':
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggaWQ9ImJhcl9jaGFydCIgZD0iTTI2LjQ2MTMgMzJDMjUuOTE1MiAzMiAyNS40NTcyIDMxLjgxNTEgMjUuMDg3NSAzMS40NDUzQzI0LjcxOCAzMS4wNzU5IDI0LjUzMzMgMzAuNjE4IDI0LjUzMzMgMzAuMDcxNVYyMS4zMzMzQzI0LjUzMzMgMjAuNzg3MiAyNC43MTggMjAuMzI5MiAyNS4wODc1IDE5Ljk1OTVDMjUuNDU3MiAxOS41OSAyNS45MTUyIDE5LjQwNTMgMjYuNDYxMyAxOS40MDUzSDMwLjA3MTVDMzAuNjE4IDE5LjQwNTMgMzEuMDc1OSAxOS41OSAzMS40NDUzIDE5Ljk1OTVDMzEuODE1MSAyMC4zMjkyIDMyIDIwLjc4NzIgMzIgMjEuMzMzM1YzMC4wNzE1QzMyIDMwLjYxOCAzMS44MTUxIDMxLjA3NTkgMzEuNDQ1MyAzMS40NDUzQzMxLjA3NTkgMzEuODE1MSAzMC42MTggMzIgMzAuMDcxNSAzMkgyNi40NjEzWk0xNC4xOTQ3IDMyQzEzLjY0ODUgMzIgMTMuMTkwNiAzMS44MTUxIDEyLjgyMDggMzEuNDQ1M0MxMi40NTE0IDMxLjA3NTkgMTIuMjY2NyAzMC42MTggMTIuMjY2NyAzMC4wNzE1VjEuOTI4NTNDMTIuMjY2NyAxLjM4MjA0IDEyLjQ1MTQgMC45MjQwOSAxMi44MjA4IDAuNTU0NjY4QzEzLjE5MDYgMC4xODQ4OSAxMy42NDg1IDAgMTQuMTk0NyAwSDE3LjgwNTNDMTguMzUxNSAwIDE4LjgwOTQgMC4xODQ4OSAxOS4xNzkyIDAuNTU0NjY4QzE5LjU0ODYgMC45MjQwOSAxOS43MzMzIDEuMzgyMDQgMTkuNzMzMyAxLjkyODUzVjMwLjA3MTVDMTkuNzMzMyAzMC42MTggMTkuNTQ4NiAzMS4wNzU5IDE5LjE3OTIgMzEuNDQ1M0MxOC44MDk0IDMxLjgxNTEgMTguMzUxNSAzMiAxNy44MDUzIDMySDE0LjE5NDdaTTEuOTI4NTMgMzJDMS4zODIwNCAzMiAwLjkyNDA4OSAzMS44MTUxIDAuNTU0NjY2IDMxLjQ0NTNDMC4xODQ4ODkgMzEuMDc1OSAwIDMwLjYxOCAwIDMwLjA3MTVWMTIuMzk5NUMwIDExLjg0MzQgMC4xODQ4ODkgMTEuMzgxMyAwLjU1NDY2NiAxMS4wMTMzQzAuOTI0MDg5IDEwLjY0NTcgMS4zODIwNCAxMC40NjE5IDEuOTI4NTMgMTAuNDYxOUg1LjUzODY3QzYuMDg0OCAxMC40NjE5IDYuNTQyNzYgMTAuNjQ2NiA2LjkxMjUzIDExLjAxNkM3LjI4MTk2IDExLjM4NTQgNy40NjY2NyAxMS44NDM0IDcuNDY2NjcgMTIuMzg5OVYzMC4wNjE5QzcuNDY2NjcgMzAuNjE4MyA3LjI4MTk2IDMxLjA4MDQgNi45MTI1MyAzMS40NDhDNi41NDI3NiAzMS44MTYgNi4wODQ4IDMyIDUuNTM4NjcgMzJIMS45Mjg1M1oiIGZpbGw9IiMxRDFEMUQiLz4KPC9zdmc+Cg==',
  anonymous:
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgaWQ9Ikljb24mIzYwO01lZGl1bSYjNjI7L0Fub255bW91cyI+CjxtYXNrIGlkPSJtYXNrMF85NjM3XzUzMzM5IiBzdHlsZT0ibWFzay10eXBlOmFscGhhIiBtYXNrVW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4PSIwIiB5PSIwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiPgo8cmVjdCBpZD0iQm91bmRpbmcgYm94IiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9IiNEOUQ5RDkiLz4KPC9tYXNrPgo8ZyBtYXNrPSJ1cmwoI21hc2swXzk2MzdfNTMzMzkpIj4KPHBhdGggaWQ9InZpc2liaWxpdHlfbG9jayIgZD0iTTEzLjgzMTcgMTYuNTkyNkMxMy43MTI4IDE2LjU5MjYgMTMuNjEzMSAxNi41NTIzIDEzLjUzMjYgMTYuNDcxOUMxMy40NTIxIDE2LjM5MTQgMTMuNDExOSAxNi4yOTE2IDEzLjQxMTkgMTYuMTcyOFYxMy4yOTNDMTMuNDExOSAxMy4xNzU1IDEzLjQ1NzggMTMuMDczOSAxMy41NDk2IDEyLjk4ODRDMTMuNjQxNiAxMi45MDMgMTMuNzQ5IDEyLjg2NzIgMTMuODcxOSAxMi44ODExSDE0LjM3MTlWMTEuODgxMUMxNC4zNzE5IDExLjUwMTYgMTQuNTA3NiAxMS4xNzY5IDE0Ljc3ODggMTAuOTA2N0MxNS4wNTAxIDEwLjYzNjQgMTUuMzc2MiAxMC41MDEzIDE1Ljc1NzEgMTAuNTAxM0MxNi4xMzgxIDEwLjUwMTMgMTYuNDYxIDEwLjYzNjQgMTYuNzI1OSAxMC45MDY3QzE2Ljk5MDkgMTEuMTc2OSAxNy4xMjM0IDExLjUwMTYgMTcuMTIzNCAxMS44ODExVjEyLjg4MTFIMTcuNjIzNEMxNy43NDkxIDEyLjg4MTEgMTcuODU3MSAxMi45MTk2IDE3Ljk0NzYgMTIuOTk2N0MxOC4wMzgxIDEzLjA3MzkgMTguMDgzNCAxMy4xNzI3IDE4LjA4MzQgMTMuMjkzVjE2LjE3MjhDMTguMDgzNCAxNi4yOTE2IDE4LjA0MzEgMTYuMzkxNCAxNy45NjI2IDE2LjQ3MTlDMTcuODgyMSAxNi41NTIzIDE3Ljc4MjQgMTYuNTkyNiAxNy42NjM0IDE2LjU5MjZIMTMuODMxN1pNMTUuMDI1NyAxMi44ODExSDE2LjQ2OTZWMTEuODgxMUMxNi40Njk2IDExLjY2ODYgMTYuNDAzNSAxMS40OTQ1IDE2LjI3MTMgMTEuMzU4OEMxNi4xMzkxIDExLjIyMyAxNS45Njc0IDExLjE1NTEgMTUuNzU2MSAxMS4xNTUxQzE1LjU0NDkgMTEuMTU1MSAxNS4zNzAzIDExLjIyMyAxNS4yMzI0IDExLjM1ODhDMTUuMDk0NiAxMS40OTQ1IDE1LjAyNTcgMTEuNjY4NiAxNS4wMjU3IDExLjg4MTFWMTIuODgxMVpNMTAuMDAwMSAxMi4wMDEzQzkuNDQ0NTEgMTIuMDAxMyA4Ljk3MjI4IDExLjgwNjkgOC41ODM0IDExLjQxOEM4LjE5NDUxIDExLjAyOTEgOC4wMDAwNiAxMC41NTY5IDguMDAwMDYgMTAuMDAxM0M4LjAwMDA2IDkuNDQ1NzUgOC4xOTQ1MSA4Ljk3MzUyIDguNTgzNCA4LjU4NDY0QzguOTcyMjggOC4xOTU3NSA5LjQ0NDUxIDguMDAxMyAxMC4wMDAxIDguMDAxM0MxMC41NTU2IDguMDAxMyAxMS4wMjc4IDguMTk1NzUgMTEuNDE2NyA4LjU4NDY0QzExLjgwNTYgOC45NzM1MiAxMi4wMDAxIDkuNDQ1NzUgMTIuMDAwMSAxMC4wMDEzQzEyLjAwMDEgMTAuNTU2OSAxMS44MDU2IDExLjAyOTEgMTEuNDE2NyAxMS40MThDMTEuMDI3OCAxMS44MDY5IDEwLjU1NTYgMTIuMDAxMyAxMC4wMDAxIDEyLjAwMTNaTTEwLjAwMDEgMTUuNTg0NkM4LjI4NjA0IDE1LjU4NDYgNi42ODM5NSAxNS4xMzg5IDUuMTkzODEgMTQuMjQ3M0MzLjcwMzUzIDEzLjM1NTcgMi41NjMxMiAxMi4xNDU2IDEuNzcyNTYgMTAuNjE3MUMxLjcxODEyIDEwLjUxOTggMS42NzgzMyAxMC40MjA5IDEuNjUzMTkgMTAuMzIwNUMxLjYyODA1IDEwLjIyMDEgMS42MTU0OCAxMC4xMTM3IDEuNjE1NDggMTAuMDAxM0MxLjYxNTQ4IDkuODg4OTQgMS42MjgwNSA5Ljc4MjU1IDEuNjUzMTkgOS42ODIxNEMxLjY3ODMzIDkuNTgxNzIgMS43MTgxMiA5LjQ4MjgzIDEuNzcyNTYgOS4zODU0N0MyLjU2MzEyIDcuODU3IDMuNzAzNTMgNi42NDY5MyA1LjE5MzgxIDUuNzU1MjZDNi42ODM5NSA0Ljg2MzczIDguMjg2MDQgNC40MTc5NyAxMC4wMDAxIDQuNDE3OTdDMTAuODg3NiA0LjQxNzk3IDExLjczOTUgNC41MzcxMyAxMi41NTU5IDQuNzc1NDdDMTMuMzcyMyA1LjAxMzY2IDE0LjEzNDEgNS4zNTAxOSAxNC44NDEzIDUuNzg1MDVDMTUuMzk1NSA2LjEyMTcyIDE1LjkwNzcgNi41MDk1NyAxNi4zNzggNi45NDg1OUMxNi44NDgzIDcuMzg3NjIgMTcuMjcyNSA3Ljg3NzQxIDE3LjY1MDcgOC40MTc5N0MxNy43OTI4IDguNjI3NDEgMTcuOCA4Ljg0NjQ0IDE3LjY3MjQgOS4wNzUwNUMxNy41NDQ3IDkuMzAzNjYgMTcuMzUzMiA5LjQxNzk3IDE3LjA5NzggOS40MTc5N0gxNS43NTE3QzE1LjIzODcgOS40MTc5NyAxNC43NjE5IDkuNDg2MzcgMTQuMzIxMyA5LjYyMzE4QzEzLjg4MDYgOS43NTk4NCAxMy40ODQgOS45NjQ5OCAxMy4xMzE1IDEwLjIzODZDMTMuMTM2OCAxMC4xOTQ3IDEzLjE0MDggMTAuMTUzNyAxMy4xNDM0IDEwLjExNTdDMTMuMTQ2MiAxMC4wNzc2IDEzLjE0NzYgMTAuMDM5NSAxMy4xNDc2IDEwLjAwMTNDMTMuMTQ3NiA5LjEyNyAxMi44NDE0IDguMzgzODcgMTIuMjI5IDcuNzcxOTNDMTEuNjE2NyA3LjE1OTg0IDEwLjg3MyA2Ljg1MzggOS45OTgxOSA2Ljg1MzhDOS4xMjMzMyA2Ljg1MzggOC4zODAzNCA3LjE1OTk4IDcuNzY5MjMgNy43NzIzNEM3LjE1ODEyIDguMzg0NzEgNi44NTI1NiA5LjEyODMyIDYuODUyNTYgMTAuMDAzMkM2Ljg1MjU2IDEwLjg3OCA3LjE1ODYgMTEuNjIxIDcuNzcwNjkgMTIuMjMyMUM4LjM4MjYzIDEyLjg0MzIgOS4xMjU3NiAxMy4xNDg4IDEwLjAwMDEgMTMuMTQ4OEMxMC4zNjEyIDEzLjE0ODggMTAuNzEgMTMuMDkwNSAxMS4wNDY1IDEyLjk3NEMxMS4zODMgMTIuODU3NiAxMS42ODQ5IDEyLjY5NjkgMTEuOTUxOSAxMi40OTE3QzExLjk0MTIgMTIuNTIzNyAxMS45MzE5IDEyLjU3MTggMTEuOTI0IDEyLjYzNjFDMTEuOTE2IDEyLjcwMDMgMTEuOTExOSAxMi43NjU5IDExLjkxMTkgMTIuODMzVjE0Ljc5MjZDMTEuOTExOSAxNC45NzAzIDExLjg1NjkgMTUuMTI3MiAxMS43NDY3IDE1LjI2MzJDMTEuNjM2NiAxNS4zOTkzIDExLjQ5MzUgMTUuNDc4NyAxMS4zMTc0IDE1LjUwMTNDMTEuMTAyNSAxNS41MjkxIDEwLjg4NzYgMTUuNTQ5OSAxMC42NzI2IDE1LjU2MzhDMTAuNDU3NyAxNS41Nzc3IDEwLjIzMzUgMTUuNTg0NiAxMC4wMDAxIDE1LjU4NDZaIiBmaWxsPSJ3aGl0ZSIvPgo8L2c+CjwvZz4KPC9zdmc+Cg==',
  'stop-watch':
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgaWQ9Ikljb24mIzYwO01lZGl1bSYjNjI7L1N0b3BfV2F0Y2giPgo8bWFzayBpZD0ibWFzazBfOTYzN181MzMwNiIgc3R5bGU9Im1hc2stdHlwZTphbHBoYSIgbWFza1VuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeD0iMCIgeT0iMCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIj4KPHJlY3QgaWQ9IkJvdW5kaW5nIGJveCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjRDlEOUQ5Ii8+CjwvbWFzaz4KPGcgbWFzaz0idXJsKCNtYXNrMF85NjM3XzUzMzA2KSI+CjxwYXRoIGlkPSJhbGFybV9vbiIgZD0iTTkuMTQ1NzkgMTEuNTk1M0w3Ljg4OTMzIDEwLjMzODlDNy43NTQwNiAxMC4yMDExIDcuNTk1NzkgMTAuMTMwOCA3LjQxNDU0IDEwLjEyOEM3LjIzMzI5IDEwLjEyNTQgNy4wNzEwNyAxMC4xOTM1IDYuOTI3ODcgMTAuMzMyNEM2Ljc5ODU3IDEwLjQ3MTQgNi43MzM5MiAxMC42MzE0IDYuNzMzOTIgMTAuODEyNEM2LjczMzkyIDEwLjk5MzQgNi43OTg1NyAxMS4xNTM0IDYuOTI3ODcgMTEuMjkyNEw4LjY4MSAxMy4wNTg0QzguODE2NTYgMTMuMTk1MSA4Ljk3NDYxIDEzLjI2MzQgOS4xNTUxNyAxMy4yNjM0QzkuMzM1ODYgMTMuMjYzNCA5LjQ5NDYxIDEzLjE5NTEgOS42MzE0MiAxMy4wNTg0TDEzLjEwNTggOS41ODQwNkMxMy4yNDM2IDkuNDQ4OTIgMTMuMzEzOCA5LjI4ODUxIDEzLjMxNjQgOS4xMDI4MUMxMy4zMTkxIDguOTE3MjYgMTMuMjQ5OSA4Ljc1Mjg4IDEzLjEwODkgOC42MDk2OUMxMi45Njc5IDguNDY2NDkgMTIuODA1NiA4LjM5NDkgMTIuNjIxOCA4LjM5NDlDMTIuNDM4MSA4LjM5NDkgMTIuMjc0NiA4LjQ2NjQ5IDEyLjEzMTQgOC42MDk2OUw5LjE0NTc5IDExLjU5NTNaTTkuOTk5OTYgMTcuNTgyNEM5LjA4NjQ5IDE3LjU4MjQgOC4yMzA1OCAxNy40MDk3IDcuNDMyMjUgMTcuMDY0M0M2LjYzMzkyIDE2LjcxODkgNS45Mzc4MSAxNi4yNDkxIDUuMzQzOTIgMTUuNjU1MUM0Ljc0OTg5IDE1LjA2MTIgNC4yODAxNyAxNC4zNjUxIDMuOTM0NzUgMTMuNTY2OEMzLjU4OTMzIDEyLjc2ODQgMy40MTY2MiAxMS45MTI1IDMuNDE2NjIgMTAuOTk5MUMzLjQxNjYyIDEwLjA4NTYgMy41ODkzMyA5LjIyOTY5IDMuOTM0NzUgOC40MzEzNUM0LjI4MDE3IDcuNjMzMDIgNC43NDk4OSA2LjkzNjkxIDUuMzQzOTIgNi4zNDMwMkM1LjkzNzgxIDUuNzQ4OTkgNi42MzM5MiA1LjI3OTI3IDcuNDMyMjUgNC45MzM4NUM4LjIzMDU4IDQuNTg4NDQgOS4wODY0OSA0LjQxNTczIDkuOTk5OTYgNC40MTU3M0MxMC45MTM0IDQuNDE1NzMgMTEuNzY5MyA0LjU4ODQ0IDEyLjU2NzcgNC45MzM4NUMxMy4zNjYgNS4yNzkyNyAxNC4wNjIxIDUuNzQ4OTkgMTQuNjU2IDYuMzQzMDJDMTUuMjUgNi45MzY5MSAxNS43MTk3IDcuNjMzMDIgMTYuMDY1MiA4LjQzMTM1QzE2LjQxMDYgOS4yMjk2OSAxNi41ODMzIDEwLjA4NTYgMTYuNTgzMyAxMC45OTkxQzE2LjU4MzMgMTEuOTEyNSAxNi40MTA2IDEyLjc2ODQgMTYuMDY1MiAxMy41NjY4QzE1LjcxOTcgMTQuMzY1MSAxNS4yNSAxNS4wNjEyIDE0LjY1NiAxNS42NTUxQzE0LjA2MjEgMTYuMjQ5MSAxMy4zNjYgMTYuNzE4OSAxMi41Njc3IDE3LjA2NDNDMTEuNzY5MyAxNy40MDk3IDEwLjkxMzQgMTcuNTgyNCA5Ljk5OTk2IDE3LjU4MjRaTTIuMjQyMDQgNi40NDEzNUMyLjEyMTIxIDYuMzIwNjYgMi4wNjA3OSA2LjE5MTYzIDIuMDYwNzkgNi4wNTQyN0MyLjA2MDc5IDUuOTE3MDUgMi4xMjEyMSA1Ljc4ODA5IDIuMjQyMDQgNS42Njc0TDQuNjg5MTIgMy4yMjAzMUM0LjgwNDU0IDMuMTA0OSA0LjkzMjE4IDMuMDQ1ODcgNS4wNzIwNCAzLjA0MzIzQzUuMjEyMDQgMy4wNDA0NSA1LjM0MjM5IDMuMDk5NDggNS40NjMwOCAzLjIyMDMxQzUuNTgzNzggMy4zNDEwMSA1LjY0NDEyIDMuNDY5OTcgNS42NDQxMiAzLjYwNzE5QzUuNjQ0MTIgMy43NDQ1NSA1LjU4Mzc4IDMuODczNTggNS40NjMwOCAzLjk5NDI3TDIuOTk1MTcgNi40NjIxOUMyLjg3OTc1IDYuNTc3NiAyLjc1NTU4IDYuNjMzMTYgMi42MjI2NyA2LjYyODg1QzIuNDg5NjEgNi42MjQ1NSAyLjM2Mjc0IDYuNTYyMDUgMi4yNDIwNCA2LjQ0MTM1Wk0xNy43Nzg3IDYuNDQxMzVDMTcuNjU4IDYuNTYyMDUgMTcuNTI5MSA2LjYyMjQgMTcuMzkxOCA2LjYyMjRDMTcuMjU0NSA2LjYyMjQgMTcuMTI1NCA2LjU2MjA1IDE3LjAwNDcgNi40NDEzNUwxNC41NTc3IDMuOTk0MjdDMTQuNDQyMyAzLjg3ODg1IDE0LjM4MzIgMy43NTEyMiAxNC4zODA2IDMuNjExMzVDMTQuMzc3OSAzLjQ3MTM1IDE0LjQzNyAzLjM0MTAxIDE0LjU1NzcgMy4yMjAzMUMxNC42Nzg0IDMuMDk5NDggMTQuODA3NCAzLjAzOTA2IDE0Ljk0NDcgMy4wMzkwNkMxNS4wODIgMy4wMzkwNiAxNS4yMTA5IDMuMDk5NDggMTUuMzMxNiAzLjIyMDMxTDE3Ljc3ODcgNS42ODgyM0MxNy44OTQxIDUuODAzNjUgMTcuOTUzMiA1LjkyNzgxIDE3Ljk1NTggNi4wNjA3M0MxNy45NTg2IDYuMTkzNzkgMTcuODk5NSA2LjMyMDY2IDE3Ljc3ODcgNi40NDEzNVoiIGZpbGw9IndoaXRlIi8+CjwvZz4KPC9nPgo8L3N2Zz4K',
  group:
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgaWQ9Ikljb24mIzYwO01lZGl1bSYjNjI7L0F0dGVuZGVlIj4KPG1hc2sgaWQ9Im1hc2swXzk2MzdfNTMzMTciIHN0eWxlPSJtYXNrLXR5cGU6YWxwaGEiIG1hc2tVbml0cz0idXNlclNwYWNlT25Vc2UiIHg9IjAiIHk9IjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxyZWN0IGlkPSJCb3VuZGluZyBib3giIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iI0Q5RDlEOSIvPgo8L21hc2s+CjxnIG1hc2s9InVybCgjbWFzazBfOTYzN181MzMxNykiPgo8cGF0aCBpZD0iZ3JvdXBzIiBkPSJNMi4wNTQ2NiAxNC4zMjM4QzEuODc4MTQgMTQuMzIzOCAxLjcyNzY1IDE0LjI2MTYgMS42MDMyMSAxNC4xMzczQzEuNDc4OSAxNC4wMTI5IDEuNDE2NzUgMTMuODYyNCAxLjQxNjc1IDEzLjY4NTlWMTMuNDMyOEMxLjQxNjc1IDEyLjkzMzkgMS42NzE1NCAxMi41MjcxIDIuMTgxMTIgMTIuMjEyM0MyLjY5MDg1IDExLjg5NzggMy4zNjkzMiAxMS43NDA1IDQuMjE2NTQgMTEuNzQwNUM0LjM4NDE4IDExLjc0MDUgNC41NDU5OCAxMS43NDg3IDQuNzAxOTYgMTEuNzY1M0M0Ljg1NzkzIDExLjc4MTggNS4wMTUwMSAxMS44MDM5IDUuMTczMjEgMTEuODMxN0M1LjAzODYyIDEyLjA0OTggNC45MzU1IDEyLjI4NTMgNC44NjM4MyAxMi41Mzg0QzQuNzkyMyAxMi43OTE2IDQuNzU2NTQgMTMuMDQyNyA0Ljc1NjU0IDEzLjI5MTdWMTQuMzIzOEgyLjA1NDY2Wk02LjU4OTg3IDE0LjMyMzhDNi40MDA3MSAxNC4zMjM4IDYuMjQxMjYgMTQuMjU4NSA2LjExMTU0IDE0LjEyOEM1Ljk4MTY4IDEzLjk5NzYgNS45MTY3NSAxMy44Mzk1IDUuOTE2NzUgMTMuNjUzOFYxMy4zMjM4QzUuOTE2NzUgMTIuOTg5MiA2LjAwNTQzIDEyLjY5MTYgNi4xODI3OSAxMi40MzExQzYuMzYwMTUgMTIuMTcwNCA2LjYzNDE4IDExLjk0MDcgNy4wMDQ4NyAxMS43NDIxQzcuMzc1NTcgMTEuNTQzNCA3LjgxMDcxIDExLjM5NzggOC4zMTAyOSAxMS4zMDU1QzguODA5NzMgMTEuMjEzIDkuMzc1MzYgMTEuMTY2NyAxMC4wMDcyIDExLjE2NjdDMTAuNjM4MSAxMS4xNjY3IDExLjE5OTkgMTEuMjEzIDExLjY5MjQgMTEuMzA1NUMxMi4xODQ5IDExLjM5NzggMTIuNjE2NSAxMS41NDM0IDEyLjk4NzIgMTEuNzQyMUMxMy4zNTggMTEuOTI2OSAxMy42MzM0IDEyLjE1NDMgMTMuODEzNCAxMi40MjQ0QzEzLjk5MzQgMTIuNjk0NiAxNC4wODM0IDEyLjk5NDQgMTQuMDgzNCAxMy4zMjM4VjEzLjY1MzhDMTQuMDgzNCAxMy44Mzk1IDE0LjAxODEgMTMuOTk3NiAxMy44ODc2IDE0LjEyOEMxMy43NTcyIDE0LjI1ODUgMTMuNTk5MSAxNC4zMjM4IDEzLjQxMzQgMTQuMzIzOEg2LjU4OTg3Wk0xNS4yNDM2IDE0LjMyMzhWMTMuMjkyOEMxNS4yNDM2IDEzLjAzNDYgMTUuMjA2NSAxMi43ODQ1IDE1LjEzMjQgMTIuNTQyNkMxNS4wNTgxIDEyLjMwMDYgMTQuOTUzNiAxMi4wNjM3IDE0LjgxOSAxMS44MzE3QzE0Ljk1NDcgMTEuODAzOSAxNS4wOTcxIDExLjc4MTggMTUuMjQ2MSAxMS43NjUzQzE1LjM5NTIgMTEuNzQ4NyAxNS41NzcgMTEuNzQwNSAxNS43OTE3IDExLjc0MDVDMTYuNjM5IDExLjc0MDUgMTcuMzE2MSAxMS44OTkxIDE3LjgyMyAxMi4yMTY1QzE4LjMyOTkgMTIuNTMzNyAxOC41ODM0IDEyLjkzOTEgMTguNTgzNCAxMy40MzI4VjEzLjY4NTlDMTguNTgzNCAxMy44NjI0IDE4LjUyMTMgMTQuMDEyOSAxOC4zOTcgMTQuMTM3M0MxOC4yNzI1IDE0LjI2MTYgMTguMTIyIDE0LjMyMzggMTcuOTQ1NSAxNC4zMjM4SDE1LjI0MzZaTTQuMjE0MjUgMTAuNzY0NEMzLjg2MzE0IDEwLjc2NDQgMy41NjU3OCAxMC42NDIxIDMuMzIyMTYgMTAuMzk3NkMzLjA3ODU1IDEwLjE1MyAyLjk1Njc1IDkuODU1NCAyLjk1Njc1IDkuNTA0ODRDMi45NTY3NSA5LjE2MzA0IDMuMDc5MTEgOC44NjkwMSAzLjMyMzgzIDguNjIyNzZDMy41Njg0MSA4LjM3NjUxIDMuODY1OTggOC4yNTMzOCA0LjIxNjU0IDguMjUzMzhDNC41NTgzNSA4LjI1MzM4IDQuODUzNjkgOC4zNzY1MSA1LjEwMjU4IDguNjIyNzZDNS4zNTE2MSA4Ljg2OTAxIDUuNDc2MTIgOS4xNjM4NyA1LjQ3NjEyIDkuNTA3MzRDNS40NzYxMiA5Ljg1MjkgNS4zNTMwNyAxMC4xNDg4IDUuMTA2OTYgMTAuMzk1MUM0Ljg2MDk4IDEwLjY0MTMgNC41NjM0MSAxMC43NjQ0IDQuMjE0MjUgMTAuNzY0NFpNMTUuNzkxNyAxMC43NjQ0QzE1LjQ0NDUgMTAuNzY0NCAxNS4xNDc4IDEwLjY0MTMgMTQuOTAxNSAxMC4zOTUxQzE0LjY1NTMgMTAuMTQ4OCAxNC41MzIyIDkuODUyOSAxNC41MzIyIDkuNTA3MzRDMTQuNTMyMiA5LjE2Mzg3IDE0LjY1NTMgOC44NjkwMSAxNC45MDE1IDguNjIyNzZDMTUuMTQ3OCA4LjM3NjUxIDE1LjQ0NSA4LjI1MzM4IDE1Ljc5MzIgOC4yNTMzOEMxNi4xMzk1IDguMjUzMzggMTYuNDM1NyA4LjM3NjUxIDE2LjY4MiA4LjYyMjc2QzE2LjkyODIgOC44NjkwMSAxNy4wNTEzIDkuMTYzMDQgMTcuMDUxMyA5LjUwNDg0QzE3LjA1MTMgOS44NTU0IDE2LjkyODYgMTAuMTUzIDE2LjY4MyAxMC4zOTc2QzE2LjQzNzQgMTAuNjQyMSAxNi4xNDA0IDEwLjc2NDQgMTUuNzkxNyAxMC43NjQ0Wk0xMC4wMDMgMTAuMTY2N0M5LjQ3MjE3IDEwLjE2NjcgOS4wMjAwOCA5Ljk4MDU0IDguNjQ2NzUgOS42MDgxOEM4LjI3MzQyIDkuMjM1ODIgOC4wODY3NSA4Ljc4MzczIDguMDg2NzUgOC4yNTE5M0M4LjA4Njc1IDcuNzIzMTggOC4yNzI4NiA3LjI3MjM0IDguNjQ1MDggNi44OTk0M0M5LjAxNzQ0IDYuNTI2MzcgOS40Njk2IDYuMzM5ODQgMTAuMDAxNSA2LjMzOTg0QzEwLjUzMDIgNi4zMzk4NCAxMC45ODEgNi41MjY0NCAxMS4zNTQgNi44OTk2NEMxMS43MjcgNy4yNzI2OSAxMS45MTM0IDcuNzIyOTcgMTEuOTEzNCA4LjI1MDQ3QzExLjkxMzQgOC43ODExNiAxMS43MjY5IDkuMjMzMjUgMTEuMzUzOCA5LjYwNjcyQzEwLjk4MDYgOS45ODAwNSAxMC41MzA0IDEwLjE2NjcgMTAuMDAzIDEwLjE2NjdaIiBmaWxsPSJ3aGl0ZSIvPgo8L2c+CjwvZz4KPC9zdmc+Cg==',
  'co-host':
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgaWQ9Ikljb24mIzYwO01lZGl1bSYjNjI7L0NvLUhvc3QiPgo8bWFzayBpZD0ibWFzazBfOTYzN181MzMyOCIgc3R5bGU9Im1hc2stdHlwZTphbHBoYSIgbWFza1VuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeD0iMCIgeT0iMCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIj4KPHJlY3QgaWQ9IkJvdW5kaW5nIGJveCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjRDlEOUQ5Ii8+CjwvbWFzaz4KPGcgbWFzaz0idXJsKCNtYXNrMF85NjM3XzUzMzI4KSI+CjxwYXRoIGlkPSJncm91cCIgZD0iTTIuNjY1MjggMTMuOTg2N0MyLjY2NTI4IDEzLjY2ODQgMi43NDEzOSAxMy4zODkzIDIuODkzNjIgMTMuMTQ5NEMzLjA0NTg0IDEyLjkwOTYgMy4yNTg1NSAxMi43MDk4IDMuNTMxNzQgMTIuNTUwM0M0LjIxMjU3IDEyLjE0OSA0LjkyOTAzIDExLjgzMyA1LjY4MTEyIDExLjYwMjFDNi40MzMzNCAxMS4zNzE0IDcuMjg5MSAxMS4yNTYxIDguMjQ4NDEgMTEuMjU2MUM5LjIwNzg1IDExLjI1NjEgMTAuMDYzNiAxMS4zNzE0IDEwLjgxNTcgMTEuNjAyMUMxMS41Njc5IDExLjgzMyAxMi4yODQ1IDEyLjE0OSAxMi45NjUzIDEyLjU1MDNDMTMuMjM4NSAxMi43MDk4IDEzLjQ1MTIgMTIuOTA5NiAxMy42MDM0IDEzLjE0OTRDMTMuNzU1NiAxMy4zODkzIDEzLjgzMTcgMTMuNjY4NCAxMy44MzE3IDEzLjk4NjdWMTQuMzIzNEMxMy44MzE3IDE0LjYxNzEgMTMuNzI2IDE0Ljg3MzggMTMuNTE0NSAxNS4wOTM0QzEzLjMwMjkgMTUuMzEzIDEzLjA0MjIgMTUuNDIyOCAxMi43MzI0IDE1LjQyMjhIMy43NjQ0NUMzLjQ1NDczIDE1LjQyMjggMy4xOTQxIDE1LjMxNyAyLjk4MjU3IDE1LjEwNTVDMi43NzEwNSAxNC44OTM4IDIuNjY1MjggMTQuNjMzMSAyLjY2NTI4IDE0LjMyMzRWMTMuOTg2N1pNMTUuMDcyMiAxNS40MjI4QzE1LjE0OTEgMTUuMjQ1NCAxNS4yMTE2IDE1LjA2NjIgMTUuMjU5NyAxNC44ODUxQzE1LjMwNzcgMTQuNzAzOSAxNS4zMzE3IDE0LjUxNjcgMTUuMzMxNyAxNC4zMjM0VjE0LjA1MDlDMTUuMzMxNyAxMy41MzE3IDE1LjIzMjYgMTMuMDU1NSAxNS4wMzQyIDEyLjYyMjNDMTQuODM1OCAxMi4xODkzIDE0LjU3MzggMTEuODM3IDE0LjI0ODQgMTEuNTY1NUMxNC42NDA1IDExLjY3NjYgMTUuMDI4NiAxMS44MTI1IDE1LjQxMjggMTEuOTczMkMxNS43OTY4IDEyLjEzNCAxNi4xNzUzIDEyLjMyNjYgMTYuNTQ4MiAxMi41NTA5QzE2Ljc4NDMgMTIuNjgzNCAxNi45NzQ1IDEyLjg4NDcgMTcuMTE4NiAxMy4xNTQ4QzE3LjI2MjggMTMuNDI0OCAxNy4zMzQ5IDEzLjcyMzUgMTcuMzM0OSAxNC4wNTA5VjE0LjMyMzRDMTcuMzM0OSAxNC42MzMxIDE3LjIyOTEgMTQuODkzOCAxNy4wMTc2IDE1LjEwNTVDMTYuODA2IDE1LjMxNyAxNi41NDU0IDE1LjQyMjggMTYuMjM1NyAxNS40MjI4SDE1LjA3MjJaTTguMjQ4NDEgOS43NDMxOEM3LjUyOTY2IDkuNzQzMTggNi45MTk0NSA5LjQ5MjM0IDYuNDE3NzggOC45OTA2OEM1LjkxNjEyIDguNDg4ODcgNS42NjUyOCA3Ljg3ODU5IDUuNjY1MjggNy4xNTk4NEM1LjY2NTI4IDYuNDQxMDkgNS45MTYxMiA1LjgzMDg5IDYuNDE3NzggNS4zMjkyMkM2LjkxOTQ1IDQuODI3NDEgNy41Mjk2NiA0LjU3NjUxIDguMjQ4NDEgNC41NzY1MUM4Ljk2NzE2IDQuNTc2NTEgOS41Nzc0NCA0LjgyNzQxIDEwLjA3OTIgNS4zMjkyMkMxMC41ODA5IDUuODMwODkgMTAuODMxNyA2LjQ0MTA5IDEwLjgzMTcgNy4xNTk4NEMxMC44MzE3IDcuODc4NTkgMTAuNTgwOSA4LjQ4ODg3IDEwLjA3OTIgOC45OTA2OEM5LjU3NzQ0IDkuNDkyMzQgOC45NjcxNiA5Ljc0MzE4IDguMjQ4NDEgOS43NDMxOFpNMTQuMTEwNSA3LjE1OTg0QzE0LjExMDUgNy44Nzg1OSAxMy44NTk3IDguNDg4ODcgMTMuMzU4IDguOTkwNjhDMTIuODU2MyA5LjQ5MjM0IDEyLjI0NjEgOS43NDMxOCAxMS41Mjc0IDkuNzQzMThDMTEuNDc1IDkuNzQzMTggMTEuNDQ1NiA5Ljc0NjM3IDExLjQzOTIgOS43NTI3NkMxMS40MzI3IDkuNzU5MTUgMTEuNDAzMyA5Ljc1NjUxIDExLjM1MTEgOS43NDQ4NEMxMS42NTE5IDkuMzkxMzcgMTEuODkwNiA4Ljk5ODE4IDEyLjA2NzIgOC41NjUyNkMxMi4yNDM1IDguMTMyMzQgMTIuMzMxNyA3LjY2MzU5IDEyLjMzMTcgNy4xNTkwMUMxMi4zMzE3IDYuNjU0MjkgMTIuMjQxNyA2LjE4NzQxIDEyLjA2MTcgNS43NTgzOUMxMS44ODE3IDUuMzI5NSAxMS42NDQ5IDQuOTM1MDUgMTEuMzUxMSA0LjU3NTA1QzExLjM4NzQgNC41NzM5NCAxMS40MTY3IDQuNTczOTQgMTEuNDM5MiA0LjU3NTA1QzExLjQ2MTYgNC41NzYwMiAxMS40OTEgNC41NzY1MSAxMS41Mjc0IDQuNTc2NTFDMTIuMjQ2MSA0LjU3NjUxIDEyLjg1NjMgNC44Mjc0MSAxMy4zNTggNS4zMjkyMkMxMy44NTk3IDUuODMwODkgMTQuMTEwNSA2LjQ0MTA5IDE0LjExMDUgNy4xNTk4NFoiIGZpbGw9IndoaXRlIi8+CjwvZz4KPC9nPgo8L3N2Zz4K',
};

export default pollIcons;
export type {PollIconsInterface};