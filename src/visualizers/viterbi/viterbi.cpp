#include <iostream>
#include <vector>
#include <set>
#include <ranges>
#include <algorithm>
#include <cassert>
#include <fstream>
#include <random>

#define assertm(exp, msg) assert(((void)msg, exp))


using namespace std;

template<typename T = int>
using matrix = vector<vector<T> >;

matrix<int> &read_matrix(ifstream &input, int n, int m) {
    auto result = new matrix<int>(n, vector<int>(m));
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < m; j++) {
            input >> result->at(i).at(j);
        }
    }
    return *result;
}

template<typename T>
std::ostream &operator<<(std::ostream &o, vector<T> &v) {
    for (int i = 0; i < v.size(); i++) {
        o << v[i] << " ";
    }
    return o;
}

template<typename T>
std::ostream &operator<<(std::ostream &o, matrix<T> &v) {
    for (int i = 0; i < v.size(); i++) {
        for (int j = 0; j < v[i].size(); j++) {
            o << v[i][j] << " ";
        }
        o << endl;
    }
    return o;
}

void xor_row(vector<int> &target, vector<int> &source) {
    for (int i = 0; i < target.size(); i++) {
        target[i] ^= source[i];
    }
}

void make_minimal_span(matrix<int> &matrix) {
    // First make the beginnings unique
    int col = 0;
    for (int row_to_make_unique = 0; row_to_make_unique < matrix.size(); row_to_make_unique++) {
        if (matrix[row_to_make_unique][col] == 0) {
            // find a row to swap with, since we need a one here.
            for (int i = row_to_make_unique + 1; i < matrix.size(); i++) {
                if (matrix[i][col] == 1) {
                    swap(matrix[i], matrix[row_to_make_unique]);
                    break;
                }
            }
        }
        // Now this cell might be a one.
        // If it is still zero, that means that the whole column is zero. Skip it
        if (matrix[row_to_make_unique][col] == 0) {
            row_to_make_unique--;
            col++;
            continue;
        }
        // Now this cell is guaranteed to be a one.
        // We find all the rows below it that will be xored
        for (int i = row_to_make_unique + 1; i < matrix.size(); i++) {
            if (matrix[i][col] == 1) {
                xor_row(matrix[i], matrix[row_to_make_unique]);
            }
        }
        col++;
    }
    // Then make the endings unique not screwing up the beginnings.
    col = matrix[0].size() - 1;
    vector<bool> is_row_unique(matrix.size(), false);
    for (int rows_to_make_unique = matrix.size() - 1; rows_to_make_unique >= 0; rows_to_make_unique--) {
        // finding the last non-zero
        bool found = false;
        for (int last_non_zero_row = matrix.size() - 1; last_non_zero_row >= 0; last_non_zero_row--) {
            if (matrix[last_non_zero_row][col] == 1 && !is_row_unique[last_non_zero_row]) {
                // found it. Now fixing all the other rows
                for (int other_row = last_non_zero_row - 1; other_row >= 0; other_row--) {
                    if (matrix[other_row][col] == 1) {
                        xor_row(matrix[other_row], matrix[last_non_zero_row]);
                    }
                }
                is_row_unique[last_non_zero_row] = true;
                found = true;
                col--;
                break;
            }
        }
        if (!found) {
            col--;
            rows_to_make_unique++;
        }
    }
}

int get_bit(const int v, const int index) {
    return (v >> index) & 1;
}

struct layer {
    vector<int> active_rows; // list of active rows for this node.
    vector<pair<int, int > > nodes; // node[i].{first/second} is a list of indexes of nodes that are connected to node i by 0 if first, and 1 if second
};

typedef vector<layer> grid; // A grid is a list of layers.

/// Find active spans for all layers.
/// \param msf
/// \return
vector<vector<int>> find_active(matrix<int> &msf) {
    vector<int> starts = vector(msf.size(), -1); // index of first 1
    vector<int> ends = vector(msf.size(), -1); // index of last 1
    for (int column = 0; column < msf[0].size(); column++) {
        for (int row = 0; row < msf.size(); row++) {
            if (msf[row][column] == 1 && starts[row] == -1) {
                starts[row] = column;
            }
        }
    }
    for (int column = msf[0].size() - 1; column >= 0; column--) {
        for (int row = 0; row < msf.size(); row++) {
            if (msf[row][column] == 1 && ends[row] == -1) {
                ends[row] = column;
            }
        }
    }
    vector<vector<int>> result;
    for (int column = 0; column < msf[0].size(); column++) {
        result.emplace_back();
        for (int row = 0; row < msf.size(); row++) {
            if (starts[row] <= column && column < ends[row]) {
                result[column].emplace_back(row);
            }
        }
    }
    return result;
}

int bit_scalar(vector<int> &a, vector<int> &b) {
    assertm(a.size() == b.size(), "Vector sizes should match when multiplying bit vectors.");
    int result = 0;
    for (int i = 0; i < a.size(); i++) {
        result ^= a[i] & b[i];
    }
    return result;
}

grid make_grid(matrix<int> &msf) {
    grid result = grid();
    result.push_back({
                             vector<int>(),
                             {{-1, -1}}
                     });
    auto actives = find_active(msf);
    for (int column = 0; column < msf[0].size(); column++) {
        result.emplace_back(layer{
                actives[column],
                vector<pair<int, int> >((1 << (actives[column].size())),
                                                         {-1, -1})
        });
    }
    for (int column = 0; column < msf[0].size(); column++) {
        layer &now = result[column];
        layer &next = result[column + 1];
        // there exists an implementation where we only have to focus on the new active
        // But I don't want to implement it right now.
        vector<int> both_active;
        set_intersection(now.active_rows.begin(), now.active_rows.end(),
                         next.active_rows.begin(), next.active_rows.end(),
                         back_inserter(both_active));
        vector<int> any_active;
        set_union(now.active_rows.begin(), now.active_rows.end(),
                  next.active_rows.begin(), next.active_rows.end(),
                  back_inserter(any_active));
        vector<int> any_active_matrix_col; // Matrix column of any active rows
        any_active_matrix_col.reserve(any_active.size());
        for (int any_active_row: any_active) {
            any_active_matrix_col.push_back(msf[any_active_row][column]);
        }
        for (int mask_now = 0; mask_now < now.nodes.size(); mask_now++) { // all nodes from the left layer
            for (int mask_next = 0; mask_next < next.nodes.size(); mask_next++) { // all nodes from the right layer
                bool should_connect = true;
                // Have to make an edge if bits match in both.
                for (int both_active_idx: both_active) {
                    int bit_in_now = std::find(now.active_rows.begin(), now.active_rows.end(), both_active_idx) -
                                     now.active_rows.begin();
                    int bit_in_next = std::find(next.active_rows.begin(), next.active_rows.end(), both_active_idx) -
                                      next.active_rows.begin();
                    if (get_bit(mask_now, bit_in_now) != get_bit(mask_next, bit_in_next)) {
                        should_connect = false;
                    }
                }
                if (should_connect) {
                    // Have to make an edge.
                    // Is it a one or a zero edge?
                    vector<int> bit_values; // Bit values of nodes of any active
                    for (int any_active_row: any_active) {
                        auto bit_in_now_it = std::find(now.active_rows.begin(), now.active_rows.end(), any_active_row);
                        if (bit_in_now_it != now.active_rows.end()) {
                            bit_values.push_back(get_bit(mask_now, bit_in_now_it - now.active_rows.begin()));
                            continue;
                        }
                        auto bit_in_next_it = std::find(next.active_rows.begin(), next.active_rows.end(),
                                                        any_active_row);
                        if (bit_in_next_it != next.active_rows.end()) {
                            bit_values.push_back(get_bit(mask_next, bit_in_next_it - next.active_rows.begin()));
                            continue;
                        }
                        throw runtime_error(
                                "Couldn't find bit for an edge in neither now or next. This shouldn't be possible.");
                    }
                    int edge_value = bit_scalar(any_active_matrix_col, bit_values);
                    if (edge_value == 0) {
                        result[column].nodes[mask_now].first = mask_next;
                    } else {
                        result[column].nodes[mask_now].second = mask_next;
                    }
                }
            }
        }
    }
    return result;
}

vector<int> &mul(vector<int> &a, vector<vector<int>> &b) {
    assert(a.size() == b.size());
    auto ans = new vector<int>(b[0].size());
    for (int j = 0; j < b[0].size(); j++) {
        for (int i = 0; i < b.size(); i++) {
            ans->at(j) ^= a[i] & b[i][j];
        }
    }
    return *ans;
}

vector<int> &decode(grid &code_grid, vector<double> &encoded) {
    vector<vector<tuple<double, int, int> > > distance(code_grid.size());
    distance[0].push_back({0, -1, -1});
    for (int column = 0; column < encoded.size(); column++) {
        layer &now = code_grid[column];
        layer &next = code_grid[column + 1];
        distance[column + 1] = vector<tuple<double, int, int> >(next.nodes.size(), {INFINITY, -1, -1});
        for (int node = 0; node < now.nodes.size(); node++) {
            // traverse zeros
            int to_zero = now.nodes[node].first;
            if (to_zero != -1) {
                distance[column + 1][to_zero] = min(distance[column + 1][to_zero],
                                               {get<0>(distance[column][node]) + encoded[column] * -1, node, 0});
            }
            // traverse ones
            int to_one = now.nodes[node].second;
            if (to_one != -1) {
                distance[column + 1][to_one] = min(distance[column + 1][to_one],
                                               {get<0>(distance[column][node]) + encoded[column] * 1, node, 1});
            }
        }
    }
    // Getting the answer back.
    auto ans = new vector<int>();
    int cur_node = 0;
    assertm(distance[encoded.size()].size() == 1u, "Last layer is not a single node. How is that possible?");
    for (int column = encoded.size(); column > 0; column--) {
        ans->push_back(get<2>(distance[column][cur_node]));
        cur_node = get<1>(distance[column][cur_node]);
    }
    std::reverse(ans->begin(), ans->end());
    return *ans;
}

int main() {
    ifstream input("input.txt");
    ofstream output("output.txt");
    int n, k;
    input >> n >> k;
    vector<vector<int> > gen_matrix = read_matrix(input, k, n);
    vector<vector<int> > msf(gen_matrix);
    make_minimal_span(msf);
//    cout << msf;
    grid code_grid = make_grid(msf);

    for (auto &layer: code_grid) {
        output << layer.nodes.size() << " ";
    }
    output << endl;

    string action;
    while (input >> action) {
        if (action == "Encode") {
            vector<int> inp(k);
            for (int i = 0; i < k; i++) {
                input >> inp[i];
            }
            vector<int> encoded = mul(inp, gen_matrix);
//            cout << "ENC:" << encoded << endl;
            output << encoded << endl;
        } else if (action == "Decode") {
            vector<double> inp(n);
            for (int i = 0; i < n; i++) {
                input >> inp[i];
            }
            vector<int> decoded = decode(code_grid, inp);
//            cout << "DEC:" << decoded << endl;
            output << decoded << endl;
        } else if (action == "Simulate") {
            int noise, iterations, max_errors;
            input >> noise >> iterations >> max_errors;
            mt19937 gen32;
            uniform_int_distribution<> gen_inp(0, 1);
            normal_distribution<> gen_noise(0, std::sqrt(0.5 * pow(10, -noise / 10.) * (n * 1. / k)));
            int iteration = 0, errors = 0;
            vector<int> word(k);
            for (; iteration < iterations; iteration++) {
                for (int i = 0; i < k; i++) {
                    word[i] = gen_inp(gen32);
                }
                vector<int> encoded = mul(word, gen_matrix);
                vector<double> noised(n);
                for (int i = 0; i < n; i++) {
                    noised[i] = (1 - 2 * encoded[i]) + gen_noise(gen32);
                }
                vector<int> decoded = decode(code_grid, noised);
//                cerr << "====" << iteration << "====" << endl << encoded << endl << noised << endl << decoded << endl;
                for (int i = 0; i < n; i++) {
                    if (decoded[i] != encoded[i]) {
                        errors++;
                        break;
                    }
                }
                if (errors >= max_errors) {
                    break;
                }
            }
//            cerr << errors << " " << iteration << endl;
            output << fixed << errors * 1. / (iteration + 1) << endl;
        }
    }
}