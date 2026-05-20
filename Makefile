CXX = g++
CXXFLAGS = -std=c++20 -Iinclude -Wall -Wextra
LDFLAGS =

SRC_DIRS = src src/core src/renderer src/ui
SRCS = $(foreach dir,$(SRC_DIRS),$(wildcard $(dir)/*.cpp))
OBJS = $(SRCS:.cpp=.o)

TARGET = vectma

TEST_SRCS = tests/test_core.cpp
TEST_OBJS = $(TEST_SRCS:.cpp=.o)
# Filter out main.o from tests
CORE_OBJS = $(filter-out src/main.o, $(OBJS))
TEST_TARGET = test_runner

.PHONY: all clean run test

all: $(TARGET)

$(TARGET): $(OBJS)
	$(CXX) $(CXXFLAGS) -o $@ $^ $(LDFLAGS)

%.o: %.cpp
	$(CXX) $(CXXFLAGS) -c -o $@ $<

clean:
	rm -f $(OBJS) $(TARGET) $(TEST_OBJS) $(TEST_TARGET)

run: $(TARGET)
	./$(TARGET)

test: $(TEST_TARGET)
	./$(TEST_TARGET)

$(TEST_TARGET): $(TEST_OBJS) $(CORE_OBJS)
	$(CXX) $(CXXFLAGS) -o $@ $^ $(LDFLAGS)
