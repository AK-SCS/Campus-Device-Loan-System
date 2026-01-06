# Week 6 Lab Worksheet — Event Grid

## The plan
Firstly, complete the consolidation quiz on Blackboard.

Now you have two options:

### Option A: Catch up
If you're not currently chasing a Grade A in the assessment and you feel behind with the previous work:

- You can use this lab time to get help, ask questions, fix blockers, and catch-up on previous work.
- **Priority:** get your core service running, deployed, hooked up to Cosmos and committed to GitHub.

### Option B: Stretch goal (aiming for high grade)
If you're aiming for a strong grade:

- Complete the Event Grid exercises below.
- The goal is to practice sending and receiving events between services.

## Exercise 1 — Publish to Event Grid
**Goal:** Create an Event Grid Topic and publish an event to it.

1. Fork and clone the provided publisher example repo.
2. Follow the README in that repo to:
   - Create an Event Grid Topic
   - Configure the app to run locally
   - Test the app locally
   - Verify Event Grid code is running without error

You should come out of this exercise understanding:

- What an Event Grid Topic is
- What an "event" actually looks like on the wire
- How your code publishes events to Event Grid

## Exercise 2 — Subscribe an Azure Function to Event Grid
**Goal:** Deploy a Function App that receives events from Event Grid.

1. Fork and clone the provided subscriber example repo.
2. Follow the README in that repo to:
   - Locally testing the Event Grid Function
   - Deploy the Function App
   - Create an Event Grid subscription that delivers events to that deployed function
   - Confirm your function is invoked when Exercise 1 publishes an event

You should come out of this exercise understanding:

- How Event Grid delivers events (HTTP POST)
- How Azure Functions bind to those events
- Where to put the code that reacts to the event

## Exercise 3 — Apply it to YOUR service

### If your microservice should SEND events
Follow the commit steps from the pub example:

1. Add a publisher interface to your application layer.
2. Add an Event Grid adapter (in infrastructure) that implements that interface.
3. In your application-layer use case(s), call the interface at the point business logic decides "an event should be sent".
4. Follow the publisher repo README steps to provision the Azure Topic resources for your own service.

**Outcome:** your service is now capable of emitting integration events.

### If your microservice should RECEIVE events
Follow the commit steps from the sub example:

1. Add an Event Grid–triggered Azure Function to your service.
2. In that function, call into your application layer use-case functions to do real business logic. The function should not contain business rules — it should delegate.
3. Follow the subscriber repo README steps to provision the Azure Event Subscription that routes the right events into your function.

**Outcome:** your service is now reacting to integration events from elsewhere in the system.

## What "good" looks like by the end of lab
**Catch-up path:** your project builds, runs, deploys and you understand your next tasks.

**Stretch path:**
- You can prove you've published an event to Event Grid.
- You can prove you've received an event in an Azure Function.
- You've started wiring this pattern into your assessed service (either as publisher or subscriber).
