package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"strconv"
	"time"

	"github.com/buaazp/fasthttprouter"
	"github.com/valyala/fasthttp"
)

var searchMock []byte

func Mock(ctx *fasthttp.RequestCtx) {
	ctx.Response.Header.Set("Content-Type", "application/json")
	// To-DO: move this as a param
	var duration int
	if os.Args[1] != "" {
		duration, _ = strconv.Atoi(os.Args[1])
	} else {
		duration = 250
	}

	time.Sleep(time.Duration(duration) * time.Millisecond)
	ctx.Response.Header.Set("X-Server-Time", strconv.Itoa(duration))

	ctx.Write(searchMock)
}

func main() {

	m, e := ioutil.ReadFile("/app/mocks/response.json")
	if e != nil {
		fmt.Printf("Error reading mock file: %v\n", e)
		os.Exit(1)
	}
	searchMock = m

	fmt.Println("starting...")

	router := fasthttprouter.New()
	router.GET("/", Mock)

	log.Fatal(fasthttp.ListenAndServe(":80", router.Handler))

}
